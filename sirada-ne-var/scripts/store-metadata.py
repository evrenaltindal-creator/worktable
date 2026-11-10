#!/usr/bin/env python3
# App Store metinlerini fastlane/metadata/<dil>/ altina yazar.
# Metni degistirmek icin bu dosyayi duzenleyip calistirin:  python3 scripts/store-metadata.py
import os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'fastlane', 'metadata')

LOCALES = {
    'tr': {
        'name': 'Sırada Ne Var?',
        'subtitle': 'Çark ve slot ile karar verin',
        'keywords': 'karar,çark,çarkıfelek,şans,slot,rastgele,seçim,kura,çekiliş,ne yesek,plan,oyun,eğlence,arkadaş',
        'promotional_text': 'Ne yapacağınıza karar veremiyor musunuz? Seçenekleri yazın, çarkı çevirin ya da kolu çekin. Ne çıkarsa onu yapıyorsunuz!',
        'description': '''Arabayla mı gezelim, otobüsle mi? Köfteci mi, balıkçı mı? Sinema mı, evde film gecesi mi? Sırada ne var? Kararı çark versin.

SEÇENEKLERİ SİZ YAZIN
İstediğiniz kadar seçenek ekleyin (en fazla 30). Bir liste yapıştırırsanız her satır ayrı seçenek olur.

PASTADAKİ PAYI SİZ BELİRLEYİN
Bir seçeneğin şansını artırmak mı istiyorsunuz? Payını büyütün. Dilimi büyür, çıkma ihtimali de o kadar artar. Her seçeneğin yüzdesi listede yazar.

İKİ EĞLENCELİ YOL
• Çark: Işıklı lunapark çarkını çevirin, ok neyi gösterirse o.
• Slot makinesi: Kolu çekin, makara ortadaki çizgide dursun.

HAZIR LİSTELER
Gezi planı, Ne yesek?, Akşam planı ve Hafta sonu listeleriyle hemen başlayın.

VE DAHA FAZLASI
• Ses efektleri ve titreşim
• Son çıkan sonuçların listesi
• Yanlışlıkla sildiğinizi geri alma
• Açık ve koyu tema
• 7 dil: Türkçe, İngilizce, Portekizce, Almanca, Fransızca, Japonca, Korece

Sonuçlar adil bir rastgele sayı üreteciyle seçilir. Uygulama internet gerektirmez, hesap istemez ve hiçbir veri toplamaz. Seçenekleriniz yalnızca telefonunuzda saklanır.''',
    },
    'en-US': {
        'name': 'What’s Next? Spin & Decide',
        'subtitle': 'A wheel and slot machine',
        'keywords': 'decide,decision,wheel,spinner,random,picker,choice,slot,lucky,raffle,what to eat,game,party,friends',
        'promotional_text': 'Can’t decide what to do? Write your options, spin the wheel or pull the lever. Whatever comes up, that’s what you do!',
        'description': '''Go for a drive or take the bus? Burgers or fish and chips? Cinema or movie night at home? What’s next? Let the wheel decide.

WRITE YOUR OWN OPTIONS
Add as many options as you like (up to 30). Paste a list and every line becomes its own option.

YOU SET THE SHARE
Want one option to have a better chance? Give it a bigger share. Its slice grows and so does its chance. Every option shows its percentage.

TWO FUN WAYS TO PICK
• Wheel: spin the lit-up fairground wheel and see where the pointer lands.
• Slot machine: pull the lever and watch the reel stop on the line.

READY-MADE LISTS
Start right away with Day out, What to eat?, Tonight and Weekend.

AND MORE
• Sound effects and haptics
• Recent results
• Undo for anything you delete by mistake
• Light and dark themes
• 7 languages: English, Turkish, Portuguese, German, French, Japanese, Korean

Results are picked with a fair random number generator. The app works offline, needs no account and collects no data. Your options stay on your phone.''',
    },
    'pt-BR': {
        'name': 'E Agora? Gire e Decida',
        'subtitle': 'Gire a roda e decida',
        'keywords': 'decidir,decisão,roleta,roda,sorteio,aleatório,escolha,caça-níqueis,sorte,o que comer,jogo,festa',
        'promotional_text': 'Não consegue decidir? Escreva suas opções, gire a roda ou puxe a alavanca. O que sair é o que vocês vão fazer!',
        'description': '''Passear de carro ou de ônibus? Hambúrguer ou peixe na praia? Cinema ou filme em casa? E agora? Deixe a roda decidir.

ESCREVA SUAS OPÇÕES
Adicione quantas opções quiser (até 30). Cole uma lista e cada linha vira uma opção.

VOCÊ DEFINE A FATIA
Quer dar mais chance a uma opção? Aumente a fatia dela. A fatia cresce e a chance também. Cada opção mostra sua porcentagem.

DUAS FORMAS DIVERTIDAS
• Roda: gire a roda iluminada de parque de diversões e veja onde a seta para.
• Caça-níqueis: puxe a alavanca e veja o rolo parar na linha.

LISTAS PRONTAS
Comece já com Passeio, O que comer?, Hoje à noite e Fim de semana.

E MAIS
• Efeitos sonoros e vibração
• Últimos resultados
• Desfazer o que você apagou sem querer
• Tema claro e escuro
• 7 idiomas: português, inglês, turco, alemão, francês, japonês e coreano

Os resultados são sorteados com um gerador de números aleatórios justo. O app funciona sem internet, não pede conta e não coleta nenhum dado. Suas opções ficam só no seu celular.''',
    },
    'de-DE': {
        'name': 'Was Nun? Dreh und Entscheide',
        'subtitle': 'Drehen und entscheiden',
        'keywords': 'entscheiden,glücksrad,rad,zufall,zufallsgenerator,auswahl,spielautomat,glück,essen,spiel,party',
        'promotional_text': 'Du kannst dich nicht entscheiden? Schreib deine Optionen, dreh das Rad oder zieh den Hebel. Was rauskommt, wird gemacht!',
        'description': '''Mit dem Auto rumfahren oder mit dem Bus? Döner oder Fischbrötchen? Kino oder Filmabend zu Hause? Was nun? Lass das Rad entscheiden.

SCHREIB DEINE EIGENEN OPTIONEN
Füge so viele Optionen hinzu, wie du willst (bis zu 30). Füge eine Liste ein, dann wird jede Zeile eine eigene Option.

DU BESTIMMST DEN ANTEIL
Eine Option soll bessere Chancen haben? Gib ihr einen größeren Anteil. Ihr Feld wächst und ihre Chance auch. Jede Option zeigt ihren Prozentwert.

ZWEI LUSTIGE WEGE
• Rad: Dreh das leuchtende Kirmesrad und schau, wo der Zeiger stehen bleibt.
• Spielautomat: Zieh den Hebel und sieh zu, wie die Walze auf der Linie stoppt.

FERTIGE LISTEN
Starte sofort mit Ausflug, Was essen?, Heute Abend und Wochenende.

UND MEHR
• Soundeffekte und Vibration
• Letzte Ergebnisse
• Rückgängig, wenn du etwas versehentlich löschst
• Helles und dunkles Design
• 7 Sprachen: Deutsch, Englisch, Türkisch, Portugiesisch, Französisch, Japanisch, Koreanisch

Die Ergebnisse werden mit einem fairen Zufallsgenerator ausgewählt. Die App funktioniert offline, braucht kein Konto und sammelt keine Daten. Deine Optionen bleiben auf deinem Handy.''',
    },
    'fr-FR': {
        'name': 'Et Maintenant ? Tirez au sort',
        'subtitle': 'Tournez, le hasard décide',
        'keywords': 'décider,décision,roue,roulette,hasard,aléatoire,tirage,choix,machine à sous,chance,manger,jeu,soirée',
        'promotional_text': 'Vous n’arrivez pas à choisir ? Écrivez vos choix, faites tourner la roue ou tirez le levier. Ce qui sort, vous le faites !',
        'description': '''Un tour en voiture ou en bus ? Burger ou moules-frites ? Cinéma ou soirée film à la maison ? Et maintenant ? Laissez la roue décider.

ÉCRIVEZ VOS PROPRES CHOIX
Ajoutez autant de choix que vous voulez (jusqu’à 30). Collez une liste : chaque ligne devient un choix.

VOUS RÉGLEZ LES PARTS
Vous voulez donner plus de chances à un choix ? Augmentez sa part. Sa portion grandit, sa chance aussi. Chaque choix affiche son pourcentage.

DEUX FAÇONS AMUSANTES
• Roue : faites tourner la roue de fête foraine illuminée et regardez où s’arrête la flèche.
• Machine à sous : tirez le levier et regardez le rouleau s’arrêter sur la ligne.

LISTES TOUTES PRÊTES
Commencez tout de suite avec Sortie, On mange quoi ?, Ce soir et Week-end.

ET AUSSI
• Effets sonores et vibrations
• Derniers résultats
• Annuler une suppression faite par erreur
• Thème clair et sombre
• 7 langues : français, anglais, turc, portugais, allemand, japonais, coréen

Les résultats sont tirés avec un générateur de nombres aléatoires équitable. L’app fonctionne hors ligne, ne demande aucun compte et ne collecte aucune donnée. Vos choix restent sur votre téléphone.''',
    },
    'ja': {
        'name': '次はなにする？ルーレット',
        'subtitle': 'ルーレットとスロットで決めよう',
        'keywords': 'ルーレット,決める,くじ,抽選,ランダム,スロット,運,ガチャ,何食べる,迷ったら,パーティー,ゲーム,友だち',
        'promotional_text': '何をするか決められない？選択肢を書いて、ルーレットを回すかレバーを引こう。出たものに決まり！',
        'description': '''ドライブにする？バスで街めぐり？ラーメン？海鮮丼？映画館？それとも家で映画ナイト？次はなにする？迷ったらルーレットにおまかせ。

選択肢は自由に書ける
好きなだけ選択肢を追加できます（最大30個）。リストを貼り付ければ、1行ずつ別の選択肢になります。

割合も自分で決められる
当たりやすくしたい選択肢は、割合を大きくするだけ。マスが大きくなり、確率も上がります。それぞれの確率はリストに表示されます。

2つの楽しい決め方
・ルーレット：光る遊園地風のルーレットを回して、矢印が止まったところに決定。
・スロット：レバーを引いて、リールが真ん中のラインで止まるのを見届けよう。

用意されたリスト
「おでかけ」「何食べる？」「今夜の予定」「週末」ですぐに始められます。

ほかにも
・効果音と振動
・最近の結果
・間違えて消しても元に戻せる
・ライトテーマとダークテーマ
・7言語：日本語、英語、トルコ語、ポルトガル語、ドイツ語、フランス語、韓国語

結果は公平な乱数で選ばれます。オフラインで使え、アカウント登録不要、データは一切収集しません。選択肢はあなたのスマホの中だけに保存されます。''',
    },
    'ko': {
        'name': '다음은 뭐 하지? 룰렛',
        'subtitle': '룰렛과 슬롯으로 정하기',
        'keywords': '룰렛,결정,돌림판,뽑기,랜덤,추첨,슬롯,운,메뉴 정하기,뭐 먹지,게임,파티,친구',
        'promotional_text': '뭘 할지 못 정하겠다면? 선택지를 적고 룰렛을 돌리거나 레버를 당기세요. 나온 걸 하는 거예요!',
        'description': '''드라이브 갈까, 버스 타고 시내 구경할까? 떡볶이, 아니면 바닷가에서 회? 영화관, 아니면 집에서 영화의 밤? 다음은 뭐 하지? 고민될 땐 룰렛이 정해 드려요.

선택지는 직접 적어요
원하는 만큼 선택지를 추가하세요(최대 30개). 목록을 붙여 넣으면 줄마다 따로 선택지가 돼요.

비중도 직접 정해요
특정 선택지가 더 잘 나오게 하고 싶다면 비중을 늘리세요. 칸이 커지고 확률도 올라가요. 선택지마다 확률이 표시돼요.

두 가지 재미있는 방법
• 룰렛: 불빛이 반짝이는 놀이공원 룰렛을 돌리고 화살표가 멈추는 곳을 확인하세요.
• 슬롯머신: 레버를 당기고 릴이 가운데 줄에 멈추는 걸 지켜보세요.

준비된 목록
나들이, 뭐 먹지?, 오늘 밤, 주말 목록으로 바로 시작하세요.

그 밖에도
• 효과음과 진동
• 최근 결과
• 실수로 지운 것 되돌리기
• 라이트 테마와 다크 테마
• 7개 언어: 한국어, 영어, 터키어, 포르투갈어, 독일어, 프랑스어, 일본어

결과는 공정한 난수 생성기로 정해져요. 인터넷 없이도 쓸 수 있고, 계정이 필요 없으며, 어떤 데이터도 수집하지 않아요. 선택지는 내 휴대폰에만 저장돼요.''',
    },
}

LIMITS = {'name': 30, 'subtitle': 30, 'keywords': 100, 'promotional_text': 170, 'description': 4000}

problems = []
for loc, fields in LOCALES.items():
    d = os.path.join(ROOT, loc)
    os.makedirs(d, exist_ok=True)
    for key, text in fields.items():
        if len(text) > LIMITS[key]:
            problems.append(f'{loc} {key}: {len(text)} > {LIMITS[key]}')
        with open(os.path.join(d, key + '.txt'), 'w', encoding='utf-8') as f:
            f.write(text.strip() + '\n')

for key, value in {'primary_category': 'LIFESTYLE', 'secondary_category': 'ENTERTAINMENT'}.items():
    with open(os.path.join(ROOT, key + '.txt'), 'w', encoding='utf-8') as f:
        f.write(value + '\n')

if problems:
    raise SystemExit('Karakter siniri asildi:\n' + '\n'.join(problems))
print('Metinler yazildi:', ', '.join(LOCALES))
