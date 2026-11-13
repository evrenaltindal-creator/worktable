# Sırada Ne Var? 1.1.0

## Web trial update after build 2

The group home screen now includes a selectable animated wheel or slot stage. The selection engine saves one result before presentation, locks changes during playback, then reveals the same person under the pointer/reel and in the task record. Full motion lasts approximately 5.2 seconds for the wheel and 4.6 seconds for the reel; reduced motion uses a short reveal. A skip button shows the recorded result immediately. Procedural tick/chime sound is opt-in and stored as a device preference. All new labels have seven translations. No new dependencies, data uploads or server services were added.

Thirteen automated tests pass, including weighted wheel landing and slot center alignment. Local browser checks verified wheel/reel/history agreement, controls locked until reveal, exactly one task per selection, skip and persistence. These changes are prepared in source and the private web trial; they are not yet in TestFlight build 2. No new iOS upload should run before the owner's requested web trial.

## Product changes

- A persistent small-group workspace is now the home screen. Up to 30 groups, 30 participants/options per group.
- Three explicit rules: no-repeat round, independent weighted random choice, and minimum pending + completed effort during a user-selected period.
- Availability excludes a participant temporarily without deleting their identity or turn history.
- Tasks have assigned/completed/skipped/canceled states. A canceled assignment returns its current-round turn; skipped turns remain used. Skipped/canceled tasks contribute no workload.
- Every assignment records its rule, eligible pool size, weights or minimum workload, and time. Names/titles in past records remain historical snapshots.
- One-step undo for the last change, JSON backup/export/validated replacement import, local storage failure rollback.
- Seven languages retained. Previous wheel and slot-style selector remain at `quick.html`; their storage is preserved. Customized legacy lists are also migrated once to a group.
- Accountless, free; no ads, purchases, analytics or automatic synchronization. Optional file export uses the system share sheet on iOS and a browser download on web.

## Verification performed on 13 November 2026

- Nine Node tests: round persistence/no repeats, temporary absence, cancel/skip/load rules, period resets, weighted draws, group isolation, backup validation, legacy migration, complete seven-language dictionaries.
- Browser UI: create two groups, assign tasks, complete and undo, disable/re-enable person, navigate away and reopen, export JSON and restore it, workload selects previously unassigned person, navigate to preserved quick wheel and back.
- Seven UI languages checked at 390×844; no horizontal overflow observed. Desktop preview inspected at 1200×960.
- Capacitor iOS asset/plugin synchronization succeeded. File export integrates official Capacitor Filesystem/Share plugins; file timestamp API purpose is included in the app privacy manifest.
- Real iPhone native Files/Share and VoiceOver testing have NOT yet been performed for this build. Browser tests are not user beta feedback.

## Distribution

The existing App Store Connect record is 6833144391, bundle ID `com.evrenaltindal.siradanevar`. The last observed 1.0.0 build 1 is Rejected. No deletion is performed by this branch.

Owner explicitly chose to preserve this record and upload the new version on 13 November 2026. Keep the existing bundle ID. No app record deletion or replacement is authorized by that choice. The `archive` lane compiled and signed 1.1.0 (2) without upload; the `build` lane now uploads to the existing record. IPAs are retained privately for seven days by GitHub Actions.

Seven-language store description/promotional drafts are under `store/groups-metadata`. They are not uploaded automatically. Existing metadata localizations remain in `fastlane/metadata`. New screenshots must replace obsolete screenshots when the owner-selected record is prepared; do not represent the old wheel-only screenshots as the new group's main experience.

## Release disclosures

Provider remains Evren Altındal. App Store standard EULA applies; no extra acceptance gate is necessary for this free, accountless utility. Bundled help explains scope, suggestions, fairness limits, device-only storage, optional user-initiated sharing, deletion and backups. No legal or privacy declaration has been newly published to App Store Connect by this change. Public support/privacy pages at Ewocom still need checking/updating for the group features before App Review.

Sources: [Apple record removal](https://developer.apple.com/help/app-store-connect/create-an-app-record/remove-an-app), [Apple Standard EULA](https://www.apple.com/legal/internet-services/itunes/dev/stdeula/), [Capacitor Filesystem](https://capacitorjs.com/docs/apis/filesystem), [Capacitor Share](https://capacitorjs.com/docs/apis/share).
