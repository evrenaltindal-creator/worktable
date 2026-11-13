# Prepare the already uploaded build. Never submits a review or changes release policy.
require 'net/http'
require 'uri'
require 'json'

module SNVPrepare
  def self.call(token, store)
    request = lambda do |method, path, query = {}, body = nil|
      uri = URI("https://api.appstoreconnect.apple.com/v1/#{path}")
      uri.query = URI.encode_www_form(query) unless query.empty?
      req = Net::HTTP.const_get(method.capitalize).new(uri)
      req['Authorization'] = "Bearer #{token}"
      req['Content-Type'] = 'application/json'
      req.body = JSON.generate(body) if body
      response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true, read_timeout: 60) { |http| http.request(req) }
      parsed = response.body.to_s.empty? ? {} : JSON.parse(response.body)
      unless response.is_a?(Net::HTTPSuccess)
        codes = Array(parsed['errors']).map { |e| e['code'] }.join(', ')
        raise "Apple #{method} #{path}: HTTP #{response.code} (#{codes})"
      end
      parsed
    end
    app = '6833144391'
    version = '1.1.0'
    versions = request.call('get', "apps/#{app}/appStoreVersions", { 'filter[platform]' => 'IOS', 'filter[versionString]' => version })['data']
    raise 'Expected one existing 1.1.0 version' unless versions.length == 1
    draft = versions.first
    raise 'Version is not editable' unless %w[PREPARE_FOR_SUBMISSION REJECTED METADATA_REJECTED DEVELOPER_REJECTED].include?(draft.dig('attributes', 'appStoreState'))
    build = request.call('get', 'builds/c837a525-a2de-44a1-b1bb-cd5ad83db186', { 'include' => 'app,preReleaseVersion' })
    attrs = build.fetch('data').fetch('attributes')
    raise 'Unexpected build number/state' unless attrs['version'] == '3' && attrs['processingState'] == 'VALID'
    raise 'Unexpected app' unless build.dig('data', 'relationships', 'app', 'data', 'id') == app
    release = build.fetch('included').find { |item| item['type'] == 'preReleaseVersions' }
    raise 'Unexpected release' unless release.dig('attributes', 'version') == version
    id = draft.fetch('id')
    request.call('patch', "appStoreVersions/#{id}/relationships/build", {}, { data: { type: 'builds', id: build['data']['id'] } })
    selected = request.call('get', "appStoreVersions/#{id}/build")['data']
    raise 'Build attachment readback failed' unless selected['id'] == build['data']['id']

    notes = File.read(File.join(store, 'build3-test-notes.txt'), encoding: 'bom|utf-8').strip
    beta_path = "builds/#{selected['id']}/betaBuildLocalizations"
    beta = request.call('get', beta_path)['data'].find { |item| item.dig('attributes', 'locale') == 'tr' }
    if beta
      request.call('patch', "betaBuildLocalizations/#{beta['id']}", {}, { data: { type: 'betaBuildLocalizations', id: beta['id'], attributes: { whatsNew: notes } } })
    else
      request.call('post', 'betaBuildLocalizations', {}, { data: { type: 'betaBuildLocalizations', attributes: { locale: 'tr', whatsNew: notes }, relationships: { build: { data: { type: 'builds', id: selected['id'] } } } } })
    end
    beta_after = request.call('get', beta_path)['data'].find { |item| item.dig('attributes', 'locale') == 'tr' }
    raise 'Beta notes readback failed' unless beta_after.dig('attributes', 'whatsNew') == notes

    updates = JSON.parse(File.read(File.join(store, 'task-metadata-update.json'), encoding: 'bom|utf-8'))
    localizations = request.call('get', "appStoreVersions/#{id}/appStoreVersionLocalizations")['data']
    updates.each do |update|
      item = localizations.find { |loc| loc.dig('attributes', 'locale') == update['code'] }
      raise "Missing existing locale #{update['code']}" unless item
      current = item.dig('attributes', 'description')
      next if current == update['expected']
      raise "Concurrent description change: #{update['code']}" unless current == update['before']
      request.call('patch', "appStoreVersionLocalizations/#{item['id']}", {}, { data: { type: 'appStoreVersionLocalizations', id: item['id'], attributes: { description: update['expected'] } } })
    end
    after = request.call('get', "appStoreVersions/#{id}/appStoreVersionLocalizations")['data']
    verified = updates.map do |update|
      actual = after.find { |loc| loc.dig('attributes', 'locale') == update['code'] }.dig('attributes', 'description')
      raise "Description readback failed: #{update['code']}" unless actual == update['expected']
      { locale: update['code'], description: actual, verified: true }
    end
    final_draft = request.call('get', "appStoreVersions/#{id}")['data']
    report = { app_id: app, version: version, build: attrs['version'], processing_state: attrs['processingState'], initial_version_state: draft.dig('attributes', 'appStoreState'), version_state: final_draft.dig('attributes', 'appStoreState'), attached_build_id: selected['id'], beta_notes_verified: true, localizations: verified, submitted_for_review: false }
    FileUtils.mkdir_p(File.join(store, 'verification'))
    File.write(File.join(store, 'verification', 'build3.json'), JSON.pretty_generate(report))
    puts JSON.generate(report.reject { |key, _| key == :localizations }.merge(verified_locales: verified.map { |loc| loc[:locale] }))
  end
end
