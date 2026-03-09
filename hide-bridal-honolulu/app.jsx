import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ─── Constants ───────────────────────────────────────────────────────────────
const WEDDING_DATE = new Date(2026, 5, 28);
const MARATHON_DATE = new Date(2026, 11, 13);
const TRAVEL_START = "2026-06-29";
const TRAVEL_END = "2026-07-05";

const PHASE_COLORS = { 1:"#2E7D32", 2:"#E65100", 3:"#F9A825", 4:"#5C6BC0", 5:"#1565C0", 6:"#AD1457" };
const PHASE_BG = { 1:"#E8F5E9", 2:"#FFF3E0", 3:"#FFFDE7", 4:"#E8EAF6", 5:"#E3F2FD", 6:"#FCE4EC" };

const CATEGORIES = [
  { id:"food", label:"食事", icon:"🍽️" },
  { id:"gym", label:"筋トレ", icon:"🏋️" },
  { id:"run", label:"ラン", icon:"🏃" },
  { id:"snack", label:"間食", icon:"🍫" },
  { id:"sleep", label:"睡眠", icon:"😴" },
];

// ─── Week Data ───────────────────────────────────────────────────────────────
const WEEKS_DATA = [
  // Phase 1: 習慣構築 (W1-4)
  { week:1, dateRange:"3/8〜3/14", startDate:"2026-03-08", endDate:"2026-03-14",
    phase:{number:1,emoji:"💪",name:"習慣構築"},
    food:["朝食を「ゆで卵1個＋ギリシャヨーグルト」に固定","あすけんでタンパク質量を記録開始（2週間限定）","昼コンビニはサラダチキン＋おにぎりを基本セットに","夕食のメインを肉か魚150g以上に"],
    gym:["週3回ジム確立（月・水・金の仕事後）","Day1：ベンチプレス5×8＋バーベルロウ5×10","Day2：スクワット5×8＋サイドレイズ4×15","Day3：OHP4×8＋ラットプルダウン5×10"],
    run:["休日に20〜30分ゆっくりジョグ（会話ペース）"],
    snack:["仕事中のチョコ・菓子パン→プロテインバー＋高カカオチョコ2粒に置換（まず週3日から）"],
    sleep:["22時台就寝を目指す（まず22:30目標）"],
    note:"まず「朝の卵ヨーグルト」「昼のサラダチキン」「間食置換3日」の3つだけ守る" },
  { week:2, dateRange:"3/15〜3/21", startDate:"2026-03-15", endDate:"2026-03-21",
    phase:{number:1,emoji:"💪",name:"習慣構築"},
    food:["あすけんでタンパク質量を確認（90g目標）","不足食事を特定","昼食にゆで卵1個追加（+7g）","夕食ルーティン化：鶏むねソテー or 鮭の塩焼き"],
    gym:["週3回継続・フォーム確認","重量を「10回ギリギリ」に設定","全種目の重量を記録開始"],
    run:["休日に20〜30分ジョグ継続"],
    snack:["プロテインバー置換を週4日に拡大","仕事机にプロテインバーを常備"],
    sleep:["22:30就寝を定着させる"],
    note:"タンパク質の「穴」を見つけるのが最重要タスク" },
  { week:3, dateRange:"3/22〜3/28", startDate:"2026-03-22", endDate:"2026-03-28",
    phase:{number:1,emoji:"💪",name:"習慣構築"},
    food:["タンパク質90gの達成パターンを確立","22時以降の食事を控える"],
    gym:["週3回継続","漸進的過負荷開始（前週+2.5kgまたは+1rep）"],
    run:["ジョグを30分に延長（3〜5km目安）"],
    snack:["置換を平日全日に拡大","ギリシャヨーグルト追加OK"],
    sleep:["6.5時間以上を安定させる"],
    note:"体重を週1回測定開始（毎週日曜・朝食前・同じ服装で）" },
  { week:4, dateRange:"3/29〜4/4", startDate:"2026-03-29", endDate:"2026-04-04",
    phase:{number:1,emoji:"💪",name:"習慣構築"},
    food:["あすけん卒業OK","タンパク質ルーティン継続","白米を気持ち少なめ（2/3程度）"],
    gym:["週3回継続","全種目のMAX重量ベースラインを記録"],
    run:["休日ジョグ継続（3〜5km完走確認）"],
    snack:["平日全日の置換継続"],
    sleep:["22時就寝の定着"],
    note:"Phase1チェックポイント：目標-1〜1.5kg。写真記録（正面＋横）" },
  // Phase 2: 体組成リモデリング (W5-10)
  { week:5, dateRange:"4/5〜4/11", startDate:"2026-04-05", endDate:"2026-04-11",
    phase:{number:2,emoji:"🔥",name:"体組成リモデリング"},
    food:["タンパク質90g/日を本格意識","各食事の配分を固定化","ビールは月数回キープ"],
    gym:["週4回に増加","Push：ベンチ4×8＋サイドレイズ4×15","Pull：デッドリフト3×5＋ラットプルダウン5×10","Legs：スクワット5×8＋アブローラー3×10","Upper：OHP4×8＋チンアップ4×AMRAP＋サイドレイズ3×15"],
    run:["30分ジョグ×1（ジムと別日に）"],
    snack:["プロテインバー置換継続"],
    sleep:["22時就寝継続"],
    note:"週4回ジムへの移行週。最初は強度をやや落として慣れる" },
  { week:6, dateRange:"4/12〜4/18", startDate:"2026-04-12", endDate:"2026-04-18",
    phase:{number:2,emoji:"🔥",name:"体組成リモデリング"},
    food:["タンパク質90g継続","「ながら食べなしデー」を週3回設定","夕食の炭水化物をやや控えめに"],
    gym:["週4回継続","サイドレイズの重量UP（スーツ映えの要）"],
    run:["30分ジョグ×1"],
    snack:["菓子パン完全卒業","チョコは高カカオ2粒のみ"],
    sleep:["7時間を目標に"],
    note:"肩のボリュームを増やす週。サイドレイズは「スーツ映え筋」の最重要種目" },
  { week:7, dateRange:"4/19〜4/25", startDate:"2026-04-19", endDate:"2026-04-25",
    phase:{number:2,emoji:"🔥",name:"体組成リモデリング"},
    food:["タンパク質90g継続","ながら食べなしデー週3回継続"],
    gym:["週4回継続","全種目の漸進的過負荷（+2.5kgまたは+1rep）","重量を毎回記録"],
    run:["30分ジョグ×1＋20分ジョグ×1"],
    snack:["置換継続"],
    sleep:["7時間継続"],
    note:"体重測定・比較。ボリュームの累積効果が出始めるタイミング" },
  { week:8, dateRange:"4/26〜5/2", startDate:"2026-04-26", endDate:"2026-05-02",
    phase:{number:2,emoji:"🔥",name:"体組成リモデリング"},
    food:["あすけん2回目（1週間だけ）：カロリー赤字400〜500kcalか確認"],
    gym:["週4回継続","漸進的過負荷継続"],
    run:["30分ジョグ×1＋20分ジョグ×1"],
    snack:["置換継続"],
    sleep:["7時間継続"],
    note:"折り返しチェックポイント。写真撮影。胸・肩・背中に変化が出始める" },
  { week:9, dateRange:"5/3〜5/9", startDate:"2026-05-03", endDate:"2026-05-09",
    phase:{number:2,emoji:"🔥",name:"体組成リモデリング"},
    food:["GW中も外食時はタンパク質優先で選ぶ","ビールは楽しんでOK（週2回程度まで）"],
    gym:["週4回継続（GWで曜日ずれてもOK）"],
    run:["40分ジョグ×2（5〜6km目安）"],
    snack:["GW中は緩めてOK（プロテインバーは持ち歩く）"],
    sleep:["7時間継続"],
    note:"GW期間。タンパク質とジム回数だけ守れば十分。楽しむこと優先" },
  { week:10, dateRange:"5/10〜5/16", startDate:"2026-05-10", endDate:"2026-05-16",
    phase:{number:2,emoji:"🔥",name:"体組成リモデリング"},
    food:["夜の炭水化物を半量に調整","仕事中の甘いものを週2回以内に"],
    gym:["週4回継続","全種目MAX重量更新チャレンジ"],
    run:["40分ジョグ×2"],
    snack:["仕事中の甘いものを週2回以内に"],
    sleep:["7時間継続"],
    note:"Phase2チェックポイント：累計-3〜3.5kg目標。体重・写真記録" },
  // Phase 3: 結婚式仕上げ (W11-16)
  { week:11, dateRange:"5/17〜5/23", startDate:"2026-05-17", endDate:"2026-05-23",
    phase:{number:3,emoji:"👑",name:"結婚式仕上げ"},
    food:["タンパク質90g維持","水分を1日2.5Lに増やす","塩分の多い加工食品を控え始める"],
    gym:["週4回継続（メニュー同じ）"],
    run:["40分ジョグ×2（6〜7km）"],
    snack:["プロテインバーのみ（甘いものは週1回ご褒美）"],
    sleep:["7時間確保を徹底","姿勢改善：毎日1分壁立ち練習"],
    note:"Phase3開始。有酸素の追加で仕上げ加速。姿勢改善はスーツ映えに直結" },
  { week:12, dateRange:"5/24〜5/30", startDate:"2026-05-24", endDate:"2026-05-30",
    phase:{number:3,emoji:"👑",name:"結婚式仕上げ"},
    food:["あすけん3回目（1週間）：最終食事パターン確認","水2.5L・塩分控えめ継続"],
    gym:["週4回継続","重量維持"],
    run:["45分ジョグ×1＋30分ジョグ×1（10km走破チャレンジ）"],
    snack:["週1回ご褒美ルール"],
    sleep:["7時間継続","姿勢練習継続"],
    note:"猫背矯正の効果が出始める。鏡でチェック" },
  { week:13, dateRange:"5/31〜6/6", startDate:"2026-05-31", endDate:"2026-06-06",
    phase:{number:3,emoji:"👑",name:"結婚式仕上げ"},
    food:["食事パターン安定運用"],
    gym:["週4回継続","重量維持"],
    run:["45分×1＋30分×1（週間10〜12km）"],
    snack:["ルール継続"],
    sleep:["7時間＋姿勢練習継続"],
    note:"体重・写真で変化確認。残り3週間の仕上げペースを確認" },
  { week:14, dateRange:"6/7〜6/13", startDate:"2026-06-07", endDate:"2026-06-13",
    phase:{number:3,emoji:"👑",name:"結婚式仕上げ"},
    food:["食事パターン継続"],
    gym:["週4回継続","重量維持"],
    run:["45分×1＋30分×1"],
    snack:["ルール継続"],
    sleep:["7時間＋姿勢練習継続"],
    note:"スーツ試着があればこの週に。肩・胸のラインと姿勢をチェック" },
  { week:15, dateRange:"6/14〜6/20", startDate:"2026-06-14", endDate:"2026-06-20",
    phase:{number:3,emoji:"👑",name:"結婚式仕上げ"},
    food:["夜の白米をさらに減量（1/3量）","塩分をさらに控える（むくみ対策）","アルコールを控える"],
    gym:["週4回継続","重量維持（怪我厳禁）"],
    run:["50分×1＋30分×1（週間12〜14km）"],
    snack:["最小限（プロテインバーのみ）"],
    sleep:["7時間＋姿勢練習継続"],
    note:"式2週間前。むくみ対策最優先" },
  { week:16, dateRange:"6/21〜6/28", startDate:"2026-06-21", endDate:"2026-06-28",
    phase:{number:3,emoji:"👑",name:"最終仕上げ"},
    food:["消化の良い食事を意識","式前日は消化の良いものだけ","水2.5L継続"],
    gym:["軽い筋トレ＋ストレッチのみ"],
    run:["軽いジョグ20分×1のみ"],
    snack:["プロテインバーのみ"],
    sleep:["7時間＋姿勢練習","十分なリラックス"],
    note:"🎉 式1週間前。コンディション最優先。十分な睡眠・水分・リラックス" },
  // Phase 4: 移行期 (W17-22)
  { week:17, dateRange:"7/6〜7/12", startDate:"2026-07-06", endDate:"2026-07-12",
    phase:{number:4,emoji:"🔄",name:"移行期"},
    food:["食事パターン維持","炭水化物を少し戻す（ラン対応）","白米は通常量に"],
    gym:["週3回に減","Day A：ベンチ4×8＋サイドレイズ3×15","Day B：ラットプルダウン4×10＋シーテッドロウ4×10","Day C：スクワット3×8＋プランク60秒×3"],
    run:["Easy Run×2（40〜50分）","Long Run 8km（週末）"],
    snack:["ルール継続（ビール頻度制限は解除、週2回目安）"],
    sleep:["7時間継続"],
    note:"筋トレ→ラン移行開始。体重維持が目標" },
  { week:18, dateRange:"7/13〜7/19", startDate:"2026-07-13", endDate:"2026-07-19",
    phase:{number:4,emoji:"🔄",name:"移行期"},
    food:["パターン継続"],
    gym:["週3回継続"],
    run:["Easy×2＋Long Run 10km"],
    snack:["継続"],
    sleep:["7時間"],
    note:"Long Run 10km達成を目指す" },
  { week:19, dateRange:"7/20〜7/26", startDate:"2026-07-20", endDate:"2026-07-26",
    phase:{number:4,emoji:"🔄",name:"移行期"},
    food:["パターン継続"],
    gym:["週3回継続"],
    run:["Easy×2＋Long Run 8km（回復週）"],
    snack:["継続"],
    sleep:["7時間"],
    note:"回復週。無理しない" },
  { week:20, dateRange:"7/27〜8/2", startDate:"2026-07-27", endDate:"2026-08-02",
    phase:{number:4,emoji:"🔄",name:"移行期"},
    food:["パターン継続"],
    gym:["週3回継続"],
    run:["Easy×2＋Long Run 12km"],
    snack:["継続"],
    sleep:["7時間"],
    note:"Long Run 12km。ハーフマラソンが視野に" },
  { week:21, dateRange:"8/3〜8/9", startDate:"2026-08-03", endDate:"2026-08-09",
    phase:{number:4,emoji:"🔄",name:"移行期"},
    food:["パターン継続"],
    gym:["週3回継続"],
    run:["Easy×2＋Long Run 14km"],
    snack:["継続"],
    sleep:["7時間"],
    note:"Long Run 14km。距離が伸びてきた実感" },
  { week:22, dateRange:"8/10〜8/15", startDate:"2026-08-10", endDate:"2026-08-15",
    phase:{number:4,emoji:"🔄",name:"移行期"},
    food:["パターン継続"],
    gym:["週3回継続"],
    run:["Easy×2＋Long Run 10km（回復週）"],
    snack:["継続"],
    sleep:["7時間"],
    note:"回復週。Phase5に向けた準備" },
  // Phase 5: マラソン基礎構築 (W23-31)
  { week:23, dateRange:"8/16〜8/22", startDate:"2026-08-16", endDate:"2026-08-22",
    phase:{number:5,emoji:"🏃",name:"マラソン基礎"},
    food:["タンパク質90g継続","炭水化物は制限しない（長距離燃料）"],
    gym:["週2回に減","Day A：ベンチ3×8＋ラットプルダウン3×10＋サイドレイズ3×15","Day B：ランジ3×10＋カーフレイズ3×15"],
    run:["Easy×2（50〜60分）","Long Run 14km"],
    snack:["継続"],
    sleep:["7時間"],
    note:"マラソン基盤構築開始。Easyペースを体に覚えさせる" },
  { week:24, dateRange:"8/23〜8/29", startDate:"2026-08-23", endDate:"2026-08-29",
    phase:{number:5,emoji:"🏃",name:"マラソン基礎"},
    food:["継続","Long Run前日は炭水化物多めに"],
    gym:["週2回継続"],
    run:["Easy×2＋Long Run 16km"],
    snack:["継続"],
    sleep:["7時間"],
    note:"Long Run 16km。水分補給を意識" },
  { week:25, dateRange:"8/30〜9/5", startDate:"2026-08-30", endDate:"2026-09-05",
    phase:{number:5,emoji:"🏃",name:"マラソン基礎"},
    food:["継続"],
    gym:["週2回継続"],
    run:["Easy×2＋Long Run 18km"],
    snack:["継続"],
    sleep:["7時間"],
    note:"Long Run 18km達成！ハーフマラソン距離が近い" },
  { week:26, dateRange:"9/6〜9/12", startDate:"2026-09-06", endDate:"2026-09-12",
    phase:{number:5,emoji:"🏃",name:"マラソン基礎"},
    food:["継続"],
    gym:["週2回継続"],
    run:["Easy×2＋Long Run 14km（回復週）"],
    snack:["継続"],
    sleep:["7時間"],
    note:"回復週。無理しない" },
  { week:27, dateRange:"9/13〜9/19", startDate:"2026-09-13", endDate:"2026-09-19",
    phase:{number:5,emoji:"🏃",name:"マラソン基礎"},
    food:["継続"],
    gym:["週2回継続"],
    run:["Easy×2＋Tempo Run 20〜30分（5:30〜6:00/km）","Long Run 20km"],
    snack:["継続"],
    sleep:["7時間"],
    note:"テンポラン導入。ペース感覚を磨く。Long Run 20km突破！" },
  { week:28, dateRange:"9/20〜9/26", startDate:"2026-09-20", endDate:"2026-09-26",
    phase:{number:5,emoji:"🏃",name:"マラソン基礎"},
    food:["継続","補給練習開始（ジェル・バナナ・スポーツドリンク）"],
    gym:["週2回継続"],
    run:["Easy×2＋Tempo＋Long Run 24km"],
    snack:["継続"],
    sleep:["7時間"],
    note:"Long Run 24km。補給の練習を本格的に" },
  { week:29, dateRange:"9/27〜10/3", startDate:"2026-09-27", endDate:"2026-10-03",
    phase:{number:5,emoji:"🏃",name:"マラソン基礎"},
    food:["継続"],
    gym:["週2回継続"],
    run:["Easy×2＋Tempo＋Long Run 28km"],
    snack:["継続"],
    sleep:["7時間"],
    note:"Long Run 28km！フルの約65%距離を体験" },
  { week:30, dateRange:"10/4〜10/10", startDate:"2026-10-04", endDate:"2026-10-10",
    phase:{number:5,emoji:"🏃",name:"マラソン基礎"},
    food:["継続"],
    gym:["週2回継続"],
    run:["Easy×2＋Long Run 18km（回復週）"],
    snack:["継続"],
    sleep:["7時間"],
    note:"回復週。体の適応を待つ" },
  { week:31, dateRange:"10/11〜10/17", startDate:"2026-10-11", endDate:"2026-10-17",
    phase:{number:5,emoji:"🏃",name:"マラソン基礎"},
    food:["継続","本番のシューズ・服装で走る"],
    gym:["週2回継続"],
    run:["Easy×2＋Tempo＋Long Run 30km ★最長"],
    snack:["継続"],
    sleep:["7時間"],
    note:"30km走達成！自信を持ってPhase6へ" },
  // Phase 6: マラソン仕上げ (W32-39)
  { week:32, dateRange:"10/18〜10/24", startDate:"2026-10-18", endDate:"2026-10-24",
    phase:{number:6,emoji:"🌺",name:"マラソン仕上げ"},
    food:["食事パターン継続"],
    gym:["週1回（全身：スクワット2×8＋ベンチ2×8＋ラットプルダウン2×10）"],
    run:["Easy×2〜3＋Tempo＋Long Run 26km"],
    snack:["継続"],
    sleep:["7時間"],
    note:"Phase6開始。追い込み期" },
  { week:33, dateRange:"10/25〜10/31", startDate:"2026-10-25", endDate:"2026-10-31",
    phase:{number:6,emoji:"🌺",name:"マラソン仕上げ"},
    food:["継続"],
    gym:["週1回継続"],
    run:["Easy×2〜3＋Long Run 22km"],
    snack:["継続"],
    sleep:["7時間"],
    note:"距離をやや落として質を維持" },
  { week:34, dateRange:"11/1〜11/7", startDate:"2026-11-01", endDate:"2026-11-07",
    phase:{number:6,emoji:"🌺",name:"マラソン仕上げ"},
    food:["継続"],
    gym:["週1回継続"],
    run:["Easy×2〜3＋Tempo＋Long Run 28km ★最終ロングラン"],
    snack:["継続"],
    sleep:["7時間"],
    note:"最終ロングラン。ここから先は距離を落としていく" },
  { week:35, dateRange:"11/8〜11/14", startDate:"2026-11-08", endDate:"2026-11-14",
    phase:{number:6,emoji:"🌺",name:"テーパリング"},
    food:["継続"],
    gym:["週1回継続"],
    run:["Easy×2＋Long Run 20km（テーパリング開始）"],
    snack:["継続"],
    sleep:["7時間"],
    note:"テーパリング開始。距離を減らしても体力は落ちない" },
  { week:36, dateRange:"11/15〜11/21", startDate:"2026-11-15", endDate:"2026-11-21",
    phase:{number:6,emoji:"🌺",name:"テーパリング"},
    food:["継続"],
    gym:["週1回継続"],
    run:["Easy×2＋Long Run 16km"],
    snack:["継続"],
    sleep:["7時間"],
    note:"さらに距離を落とす。体が軽くなる感覚を楽しむ" },
  { week:37, dateRange:"11/22〜11/28", startDate:"2026-11-22", endDate:"2026-11-28",
    phase:{number:6,emoji:"🌺",name:"テーパリング"},
    food:["継続"],
    gym:["週1回継続"],
    run:["Easy×2＋Long Run 12km"],
    snack:["継続"],
    sleep:["7時間"],
    note:"テーパリング継続。疲労抜きを意識" },
  { week:38, dateRange:"11/29〜12/5", startDate:"2026-11-29", endDate:"2026-12-05",
    phase:{number:6,emoji:"🌺",name:"テーパリング"},
    food:["継続"],
    gym:["軽い全身メニューのみ or 休み"],
    run:["Easy×2＋8kmジョグ"],
    snack:["継続"],
    sleep:["7時間以上"],
    note:"レース2週間前。走る量は最小限に" },
  { week:39, dateRange:"12/6〜12/13", startDate:"2026-12-06", endDate:"2026-12-13",
    phase:{number:6,emoji:"🌺",name:"レース週"},
    food:["カーボローディング開始（炭水化物を通常の1.5倍）","前日は消化の良い炭水化物中心","当日朝（3時頃）おにぎり2〜3個＋バナナ"],
    gym:["完全休養"],
    run:["軽いジョグ20〜30分×2〜3のみ","12/11-12は休息 or ウォーク"],
    snack:["最小限"],
    sleep:["7時間以上。十分なリラックス"],
    note:"🌺 レース週！12/13 ホノルルマラソン本番。コンディション最優先" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const toDateStr = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const parseDate = (s) => { const [y,m,d] = s.split('-').map(Number); return new Date(y,m-1,d); };
const today = () => { const n=new Date(); n.setHours(0,0,0,0); return n; };
const isTravel = (dateStr) => dateStr >= TRAVEL_START && dateStr <= TRAVEL_END;
const isTravelNow = () => { const t=toDateStr(today()); return t >= TRAVEL_START && t <= TRAVEL_END; };

const daysUntil = (target) => Math.max(0, Math.ceil((target - today()) / 86400000));
const getCurrentWeek = () => {
  const now = today();
  if (isTravelNow()) return null;
  for (const w of WEEKS_DATA) { const s=parseDate(w.startDate), e=parseDate(w.endDate); if(now>=s&&now<=e) return w; }
  if (now < parseDate(WEEKS_DATA[0].startDate)) return WEEKS_DATA[0];
  return WEEKS_DATA[WEEKS_DATA.length-1];
};
const getWeekForDate = (dateStr) => {
  if (isTravel(dateStr)) return null;
  const d=parseDate(dateStr);
  for (const w of WEEKS_DATA) { if(d>=parseDate(w.startDate)&&d<=parseDate(w.endDate)) return w; }
  return null;
};
const getItemsForWeek = (w) => {
  const items=[];
  CATEGORIES.forEach(cat => { (w[cat.id]||[]).forEach((text,i) => { items.push({key:`${cat.id}-${i}`,category:cat.id,text}); }); });
  return items;
};
const calcDayRate = (checks,weekData) => {
  if(!checks||!weekData) return 0;
  const items=getItemsForWeek(weekData);
  if(items.length===0) return 0;
  return items.filter(it=>checks[it.key]).length/items.length;
};

// ─── Storage ─────────────────────────────────────────────────────────────────
const storageGet = async (key, shared=false) => { try { const r=await window.storage.get(key,shared); return r?JSON.parse(r.value):null; } catch{return null;} };
const storageSet = async (key, val, shared=false) => { try{await window.storage.set(key,JSON.stringify(val),shared);}catch(e){console.warn('storage err',e);} };

// ─── Confetti ────────────────────────────────────────────────────────────────
const Confetti = ({active}) => {
  if(!active) return null;
  const pieces = Array.from({length:40},(_,i)=>{
    const colors=['#4A90D9','#F9A825','#2E7D32','#5C6BC0','#1565C0','#fff'];
    return (<div key={i} style={{position:'absolute',top:-20,left:`${Math.random()*100}%`,width:6+Math.random()*6,height:(6+Math.random()*6)*0.6,background:colors[i%colors.length],borderRadius:2,transform:`rotate(${Math.random()*360}deg)`,animation:`confettiFall ${2+Math.random()*1.5}s ease-in ${Math.random()*1.5}s forwards`,opacity:0}}/>);
  });
  return <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:999,overflow:'hidden'}}>{pieces}</div>;
};

// ─── Progress Ring ───────────────────────────────────────────────────────────
const ProgressRing = ({pct,size=120,stroke=10,color="#4A90D9"}) => {
  const r=(size-stroke)/2, circ=2*Math.PI*r, off=circ-(pct/100)*circ;
  return (
    <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E0E4EA" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" style={{transition:'stroke-dashoffset 0.6s ease'}}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" fill="#333" fontSize={size*0.22} fontWeight="700" style={{transform:'rotate(90deg)',transformOrigin:'center'}}>{Math.round(pct)}%</text>
    </svg>
  );
};

// ─── Settings Modal ──────────────────────────────────────────────────────────
const SettingsModal = ({show,onClose,settings,onSave}) => {
  const [local,setLocal] = useState(settings);
  useEffect(()=>{setLocal(settings);},[settings]);
  if(!show) return null;
  const handleToggle = async()=>{ const nv=!local.enabled; if(nv&&'Notification' in window&&Notification.permission==='default') await Notification.requestPermission(); setLocal(p=>({...p,enabled:nv})); };
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.35)',zIndex:100,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:'20px 20px 0 0',padding:'28px 24px 36px',width:'100%',maxWidth:480,boxShadow:'0 -4px 30px rgba(0,0,0,0.12)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
          <span style={{fontSize:18,fontWeight:700,color:'#333'}}>⚙️ 設定</span>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#999'}}>✕</button>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <span style={{fontSize:15,fontWeight:600,color:'#333'}}>🔔 リマインダー</span>
            <button onClick={handleToggle} style={{width:52,height:28,borderRadius:14,border:'none',cursor:'pointer',position:'relative',background:local.enabled?'#4A90D9':'#ddd',transition:'background 0.3s'}}>
              <div style={{width:22,height:22,borderRadius:11,background:'#fff',position:'absolute',top:3,left:local.enabled?27:3,transition:'left 0.3s',boxShadow:'0 1px 3px rgba(0,0,0,0.2)'}}/>
            </button>
          </div>
          {local.enabled && (<>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,padding:'0 4px'}}>
              <span style={{fontSize:14,color:'#666'}}>🌅 朝の通知</span>
              <select value={local.morningTime} onChange={e=>setLocal(p=>({...p,morningTime:e.target.value}))} style={{padding:'6px 10px',borderRadius:8,border:'1px solid #ddd',fontSize:14,color:'#333'}}>
                {['05:00','05:30','06:00','06:30','07:00'].map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,padding:'0 4px'}}>
              <span style={{fontSize:14,color:'#666'}}>🌙 夜の通知</span>
              <select value={local.eveningTime} onChange={e=>setLocal(p=>({...p,eveningTime:e.target.value}))} style={{padding:'6px 10px',borderRadius:8,border:'1px solid #ddd',fontSize:14,color:'#333'}}>
                {['20:00','20:30','21:00','21:30','22:00'].map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <p style={{fontSize:12,color:'#aaa',margin:'12px 0 0 4px'}}>※ ブラウザを開いている間のみ通知されます</p>
          </>)}
        </div>
        <button onClick={()=>{onSave(local);onClose();}} style={{width:'100%',padding:'14px',background:'#4A90D9',color:'#fff',border:'none',borderRadius:12,fontSize:15,fontWeight:600,cursor:'pointer'}}>保存する</button>
      </div>
    </div>
  );
};

// ─── Today Tab ───────────────────────────────────────────────────────────────
const TodayTab = ({checks,onCheck,weekData,onOpenSettings}) => {
  const todayStr = toDateStr(today());
  const isTravelMode = isTravelNow();

  if (isTravelMode) {
    return (
      <div style={{paddingBottom:20}}>
        <div style={{background:'linear-gradient(135deg,#0097A720,#0097A710)',padding:'20px 20px 16px',borderRadius:'0 0 24px 24px',marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div>
              <div style={{display:'inline-block',background:'#0097A7',color:'#fff',padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:700,marginBottom:8}}>🌴 旅行週</div>
              <div style={{fontSize:22,fontWeight:800,color:'#333',marginBottom:2}}>楽しんで！</div>
              <div style={{fontSize:13,color:'#777'}}>6/29〜7/5</div>
            </div>
            <button onClick={onOpenSettings} style={{background:'rgba(0,0,0,0.06)',border:'none',borderRadius:10,width:38,height:38,cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>⚙️</button>
          </div>
        </div>
        <div style={{textAlign:'center',padding:'60px 20px'}}>
          <div style={{fontSize:64,marginBottom:16}}>🌴</div>
          <div style={{fontSize:20,fontWeight:700,color:'#333',marginBottom:8}}>旅行を楽しんで！</div>
          <div style={{fontSize:14,color:'#777',lineHeight:1.8}}>何もしなくてOK。<br/>1週間の休養で筋力・持久力はほぼ落ちません。<br/>むしろ超回復で調子が上がることも。</div>
        </div>
      </div>
    );
  }

  if (!weekData) return null;
  const dayChecks = checks[todayStr]||{};
  const items = getItemsForWeek(weekData);
  const checkedCount = items.filter(it=>dayChecks[it.key]).length;
  const pct = items.length>0?(checkedCount/items.length)*100:0;
  const phaseColor = PHASE_COLORS[weekData.phase.number];
  const isWeddingPhase = weekData.phase.number<=3;
  const countdown = isWeddingPhase ? daysUntil(WEDDING_DATE) : daysUntil(MARATHON_DATE);
  const countdownLabel = isWeddingPhase ? '💒 挙式' : '🌺 ホノルルマラソン';

  const [openCat,setOpenCat] = useState(null);
  useEffect(()=>{setOpenCat(CATEGORIES[0].id);},[weekData.week]);

  return (
    <div style={{paddingBottom:20}}>
      <div style={{background:`linear-gradient(135deg,${phaseColor}18,${phaseColor}08)`,padding:'20px 20px 16px',borderRadius:'0 0 24px 24px',marginBottom:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <div style={{display:'inline-block',background:phaseColor,color:'#fff',padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:700,marginBottom:8}}>
              {weekData.phase.emoji} Phase {weekData.phase.number} — {weekData.phase.name}
            </div>
            <div style={{fontSize:22,fontWeight:800,color:'#333',marginBottom:2}}>Week {weekData.week} / 39</div>
            <div style={{fontSize:13,color:'#777'}}>{weekData.dateRange}</div>
          </div>
          <button onClick={onOpenSettings} style={{background:'rgba(0,0,0,0.06)',border:'none',borderRadius:10,width:38,height:38,cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>⚙️</button>
        </div>
        <div style={{textAlign:'center',marginTop:4,fontSize:13,color:phaseColor,fontWeight:600}}>
          {countdownLabel}まであと {countdown} 日
        </div>
      </div>
      <div style={{textAlign:'center',marginBottom:8}}>
        <ProgressRing pct={pct} color={phaseColor}/>
        <div style={{fontSize:13,color:'#888',marginTop:4}}>{checkedCount} / {items.length} 達成</div>
      </div>
      {CATEGORIES.map(cat=>{
        const catItems=items.filter(it=>it.category===cat.id);
        if(catItems.length===0) return null;
        const catChecked=catItems.filter(it=>dayChecks[it.key]).length;
        const isOpen=openCat===cat.id;
        return (
          <div key={cat.id} style={{margin:'0 16px 10px',borderRadius:16,overflow:'hidden',border:'1px solid #E0E4EA',background:'#fff'}}>
            <button onClick={()=>setOpenCat(isOpen?null:cat.id)} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',background:'none',border:'none',cursor:'pointer'}}>
              <span style={{fontSize:15,fontWeight:700,color:'#333'}}>{cat.icon} {cat.label}</span>
              <span style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:12,color:'#999',background:'#F0F2F5',padding:'2px 10px',borderRadius:10}}>{catChecked}/{catItems.length}</span>
                <span style={{transform:isOpen?'rotate(180deg)':'rotate(0)',transition:'transform 0.2s',fontSize:12,color:'#bbb'}}>▼</span>
              </span>
            </button>
            {isOpen&&(<div style={{padding:'0 12px 12px'}}>
              {catItems.map(item=>{
                const checked=!!dayChecks[item.key];
                return (
                  <button key={item.key} onClick={()=>onCheck(todayStr,item.key,!checked)} style={{display:'flex',alignItems:'flex-start',gap:12,width:'100%',padding:'11px 8px',background:checked?`${phaseColor}08`:'transparent',border:'none',borderRadius:10,cursor:'pointer',textAlign:'left',transition:'background 0.2s',marginBottom:2}}>
                    <div style={{width:24,height:24,minWidth:24,borderRadius:7,border:checked?'none':'2px solid #ddd',background:checked?phaseColor:'#fff',display:'flex',alignItems:'center',justifyContent:'center',marginTop:1,transition:'all 0.2s'}}>
                      {checked&&<span style={{color:'#fff',fontSize:14,fontWeight:700}}>✓</span>}
                    </div>
                    <span style={{fontSize:14,color:checked?'#bbb':'#333',textDecoration:checked?'line-through':'none',lineHeight:1.5,transition:'color 0.2s'}}>{item.text}</span>
                  </button>
                );
              })}
            </div>)}
          </div>
        );
      })}
      {weekData.note&&(
        <div style={{margin:'12px 16px 0',padding:'16px',background:`linear-gradient(135deg,${phaseColor}12,${phaseColor}06)`,borderRadius:16,borderLeft:`4px solid ${phaseColor}`}}>
          <div style={{fontSize:12,fontWeight:700,color:phaseColor,marginBottom:6}}>📝 今週のポイント</div>
          <div style={{fontSize:14,color:'#555',lineHeight:1.6}}>{weekData.note}</div>
        </div>
      )}
    </div>
  );
};

// ─── History Tab ──────────────────────────────────────────────────────────────
const HistoryTab = ({checks}) => {
  const [viewMonth,setViewMonth] = useState(()=>{const n=today();return{year:n.getFullYear(),month:n.getMonth()};});
  const [selectedDate,setSelectedDate] = useState(null);
  const streak = useMemo(()=>{
    let count=0; const d=new Date(today());
    while(true){ const ds=toDateStr(d); if(isTravel(ds)){d.setDate(d.getDate()-1);continue;} const wk=getWeekForDate(ds); const dc=checks[ds]; if(wk&&dc){const rate=calcDayRate(dc,wk);if(rate>=0.5){count++;d.setDate(d.getDate()-1);continue;}} break; }
    return count;
  },[checks]);
  const {year,month}=viewMonth;
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const weeks=[]; let week=Array(7).fill(null);
  for(let d=1;d<=daysInMonth;d++){const idx=(firstDay+d-1)%7;if(idx===0&&d>1){weeks.push(week);week=Array(7).fill(null);}week[idx]=d;}
  weeks.push(week);
  const getColor=(day)=>{
    if(!day) return 'transparent';
    const ds=toDateStr(new Date(year,month,day)); const d=parseDate(ds);
    if(d>today()) return '#f5f5f5';
    if(isTravel(ds)) return '#B2EBF2';
    const wk=getWeekForDate(ds); const dc=checks[ds];
    if(!wk||!dc) return '#eee';
    const rate=calcDayRate(dc,wk);
    if(rate>=1) return '#1565C0'; if(rate>=0.5) return '#4A90D9'; if(rate>0) return '#B3D4F0'; return '#eee';
  };
  const monthNames=['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  const dayNames=['日','月','火','水','木','金','土'];
  const selDetail=useMemo(()=>{if(!selectedDate)return null;const wk=getWeekForDate(selectedDate);if(!wk)return null;return{wk,items:getItemsForWeek(wk),dc:checks[selectedDate]||{}};},[selectedDate,checks]);
  return (
    <div style={{padding:'20px 16px'}}>
      {streak>0&&(<div style={{textAlign:'center',background:'linear-gradient(135deg,#FFF3E0,#FFF8E1)',padding:'12px',borderRadius:14,marginBottom:16}}><span style={{fontSize:20}}>🔥</span> <span style={{fontSize:16,fontWeight:700,color:'#E65100'}}>連続 {streak} 日達成中！</span></div>)}
      <div style={{background:'#fff',borderRadius:16,padding:16,border:'1px solid #E0E4EA'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <button onClick={()=>setViewMonth(p=>p.month===0?{year:p.year-1,month:11}:{...p,month:p.month-1})} style={{background:'none',border:'none',fontSize:18,cursor:'pointer',padding:'4px 8px',color:'#999'}}>‹</button>
          <span style={{fontSize:16,fontWeight:700,color:'#333'}}>{year}年 {monthNames[month]}</span>
          <button onClick={()=>setViewMonth(p=>p.month===11?{year:p.year+1,month:0}:{...p,month:p.month+1})} style={{background:'none',border:'none',fontSize:18,cursor:'pointer',padding:'4px 8px',color:'#999'}}>›</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,textAlign:'center',marginBottom:8}}>
          {dayNames.map(d=><div key={d} style={{fontSize:11,color:'#aaa',fontWeight:600,padding:'4px 0'}}>{d}</div>)}
        </div>
        {weeks.map((wk,wi)=>(
          <div key={wi} style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,textAlign:'center'}}>
            {wk.map((day,di)=>{
              const bg=getColor(day); const ds=day?toDateStr(new Date(year,month,day)):null;
              const isFuture=day&&parseDate(ds)>today(); const isToday_=day&&ds===toDateStr(today()); const isSelected=ds===selectedDate;
              const dc=ds?checks[ds]:null; const wkd=ds?getWeekForDate(ds):null; const rate=(dc&&wkd)?calcDayRate(dc,wkd):0;
              const isTravelDay=ds&&isTravel(ds);
              return (
                <button key={di} disabled={!day||isFuture} onClick={()=>day&&!isFuture&&!isTravelDay&&setSelectedDate(isSelected?null:ds)}
                  style={{width:'100%',aspectRatio:'1',borderRadius:10,background:bg,border:isSelected?'2px solid #5C6BC0':isToday_?'2px solid #4A90D9':'2px solid transparent',
                    display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:day&&!isFuture?'pointer':'default',
                    fontSize:13,fontWeight:isToday_?700:500,color:day?(isTravelDay?'#0097A7':isFuture?'#ccc':rate>=0.5?'#fff':'#555'):'transparent',padding:0,position:'relative'}}>
                  {isTravelDay?'🌴':(day||'')}
                  {rate>=1&&<span style={{fontSize:8,position:'absolute',bottom:2}}>✓</span>}
                </button>
              );
            })}
          </div>
        ))}
        <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:14,fontSize:11,color:'#999'}}>
          <span><span style={{display:'inline-block',width:12,height:12,borderRadius:3,background:'#eee',verticalAlign:'middle',marginRight:3}}/> 未記録</span>
          <span><span style={{display:'inline-block',width:12,height:12,borderRadius:3,background:'#B3D4F0',verticalAlign:'middle',marginRight:3}}/> 〜49%</span>
          <span><span style={{display:'inline-block',width:12,height:12,borderRadius:3,background:'#4A90D9',verticalAlign:'middle',marginRight:3}}/> 50%〜</span>
          <span><span style={{display:'inline-block',width:12,height:12,borderRadius:3,background:'#1565C0',verticalAlign:'middle',marginRight:3}}/> 100%</span>
        </div>
      </div>
      {selDetail&&(
        <div style={{marginTop:16,background:'#fff',borderRadius:16,padding:16,border:'1px solid #E0E4EA'}}>
          <div style={{fontSize:14,fontWeight:700,color:'#333',marginBottom:12}}>📋 {selectedDate.replace(/-/g,'/')}（Week {selDetail.wk.week}）</div>
          {CATEGORIES.map(cat=>{
            const catItems=selDetail.items.filter(it=>it.category===cat.id); if(catItems.length===0) return null;
            return (<div key={cat.id} style={{marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:600,color:'#888',marginBottom:4}}>{cat.icon} {cat.label}</div>
              {catItems.map(item=>{const checked=!!selDetail.dc[item.key];return(<div key={item.key} style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0',fontSize:13,color:checked?'#aaa':'#333'}}><span>{checked?'☑':'☐'}</span><span style={{textDecoration:checked?'line-through':'none'}}>{item.text}</span></div>);})}
            </div>);
          })}
        </div>
      )}
    </div>
  );
};

// ─── Progress Tab ────────────────────────────────────────────────────────────
const ProgressTab = ({checks,weights,runLog,onWeightSave,onRunSave}) => {
  const [wInput,setWInput] = useState('');
  const [mInput,setMInput] = useState('');
  const [rDist,setRDist] = useState('');
  const [rLong,setRLong] = useState('');
  const currentWeek = getCurrentWeek();

  const stats = useMemo(()=>{
    let totalChecked=0,perfectDays=0,maxStreak=0,curStreak=0;
    const startD=parseDate(WEEKS_DATA[0].startDate);
    const endD=new Date(Math.min(today().getTime(),parseDate(WEEKS_DATA[38].endDate).getTime()));
    const d=new Date(startD);
    while(d<=endD){
      const ds=toDateStr(d);
      if(!isTravel(ds)){
        const wk=getWeekForDate(ds); const dc=checks[ds];
        if(wk&&dc){const items=getItemsForWeek(wk);const cnt=items.filter(it=>dc[it.key]).length;totalChecked+=cnt;const rate=items.length>0?cnt/items.length:0;if(rate>=1)perfectDays++;if(rate>=0.5){curStreak++;maxStreak=Math.max(maxStreak,curStreak);}else{curStreak=0;}}else{curStreak=0;}
      }
      d.setDate(d.getDate()+1);
    }
    return {totalChecked,perfectDays,maxStreak,currentStreak:curStreak};
  },[checks]);

  const weeklyRates = useMemo(()=>WEEKS_DATA.map(w=>{
    const s=parseDate(w.startDate),e=new Date(Math.min(parseDate(w.endDate).getTime(),today().getTime()));
    if(s>today()) return {name:`W${w.week}`,rate:0,phase:w.phase.number,isFuture:true};
    let totalRate=0,days=0;const d=new Date(s);
    while(d<=e){const ds=toDateStr(d);const dc=checks[ds];if(dc){totalRate+=calcDayRate(dc,w);days++;}d.setDate(d.getDate()+1);}
    return {name:`W${w.week}`,rate:days>0?Math.round((totalRate/days)*100):0,phase:w.phase.number,isFuture:false};
  }),[checks]);

  const weightData = useMemo(()=>WEEKS_DATA.map(w=>{const wt=weights[`week-${w.week}`];return{name:`W${w.week}`,weight:wt?wt.weight:null};}).filter(d=>d.weight!==null),[weights]);

  const runData = useMemo(()=>WEEKS_DATA.map(w=>{const r=runLog[`week-${w.week}`];return{name:`W${w.week}`,distance:r?r.distance:0};}),[runLog]);

  const hasWeight = currentWeek && weights[`week-${currentWeek.week}`];
  const hasRun = currentWeek && runLog[`week-${currentWeek.week}`];

  const saveWeight=()=>{const v=parseFloat(wInput);if(isNaN(v))return;onWeightSave(currentWeek.week,v,mInput);setWInput('');setMInput('');};
  const saveRun=()=>{const d=parseFloat(rDist),l=parseFloat(rLong);if(isNaN(d))return;onRunSave(currentWeek.week,d,isNaN(l)?0:l);setRDist('');setRLong('');};

  return (
    <div style={{padding:'20px 16px',paddingBottom:20}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
        {[{icon:'✅',label:'累計チェック',value:stats.totalChecked,color:'#4A90D9'},{icon:'⭐',label:'パーフェクト日数',value:`${stats.perfectDays}日`,color:'#F9A825'},{icon:'🔥',label:'現在のストリーク',value:`${stats.currentStreak}日`,color:'#E65100'},{icon:'🏆',label:'最長ストリーク',value:`${stats.maxStreak}日`,color:'#5C6BC0'}].map((s,i)=>(
          <div key={i} style={{background:'#fff',borderRadius:14,padding:'16px 14px',border:'1px solid #E0E4EA',textAlign:'center'}}>
            <div style={{fontSize:22,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:22,fontWeight:800,color:s.color}}>{s.value}</div>
            <div style={{fontSize:11,color:'#999',marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* Phase Timeline */}
      <div style={{background:'#fff',borderRadius:14,padding:16,border:'1px solid #E0E4EA',marginBottom:16}}>
        <div style={{fontSize:14,fontWeight:700,color:'#333',marginBottom:12}}>フェーズ進行</div>
        <div style={{display:'flex',gap:4,alignItems:'center'}}>
          {[1,2,3,4,5,6].map(p=>{
            const active=currentWeek&&p<=currentWeek.phase.number; const current=currentWeek&&p===currentWeek.phase.number; const c=PHASE_COLORS[p];
            const labels={1:'💪 習慣',2:'🔥 燃焼',3:'👑 式',4:'🔄 移行',5:'🏃 基礎',6:'🌺 仕上'};
            return (<div key={p} style={{flex:1,textAlign:'center'}}>
              <div style={{height:8,borderRadius:4,background:active?c:'#eee',transition:'background 0.3s',border:current?`2px solid ${c}`:'2px solid transparent'}}/>
              <div style={{fontSize:9,color:active?c:'#ccc',marginTop:6,fontWeight:current?700:500}}>{labels[p]}</div>
            </div>);
          })}
        </div>
      </div>
      {/* Weekly Rate Chart */}
      <div style={{background:'#fff',borderRadius:14,padding:16,border:'1px solid #E0E4EA',marginBottom:16}}>
        <div style={{fontSize:14,fontWeight:700,color:'#333',marginBottom:12}}>週別達成率</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyRates} margin={{top:5,right:5,left:-20,bottom:5}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E4EA"/>
            <XAxis dataKey="name" tick={{fontSize:8,fill:'#999'}} interval={3}/>
            <YAxis domain={[0,100]} tick={{fontSize:10,fill:'#999'}}/>
            <Tooltip formatter={(v)=>`${v}%`}/>
            <Bar dataKey="rate" radius={[3,3,0,0]} fill="#4A90D9"/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Weight Chart */}
      <div style={{background:'#fff',borderRadius:14,padding:16,border:'1px solid #E0E4EA',marginBottom:16}}>
        <div style={{fontSize:14,fontWeight:700,color:'#333',marginBottom:12}}>体重推移</div>
        {weightData.length>0?(
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weightData} margin={{top:5,right:5,left:-20,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E4EA"/>
              <XAxis dataKey="name" tick={{fontSize:10,fill:'#999'}}/>
              <YAxis domain={['auto','auto']} tick={{fontSize:10,fill:'#999'}}/>
              <Tooltip formatter={(v)=>`${v}kg`}/>
              <Line type="monotone" dataKey="weight" stroke="#5C6BC0" strokeWidth={2} dot={{fill:'#5C6BC0',r:4}}/>
            </LineChart>
          </ResponsiveContainer>
        ):(<div style={{textAlign:'center',padding:24,color:'#ccc',fontSize:13}}>まだ記録がありません</div>)}
      </div>
      {/* Run Distance Chart */}
      <div style={{background:'#fff',borderRadius:14,padding:16,border:'1px solid #E0E4EA',marginBottom:16}}>
        <div style={{fontSize:14,fontWeight:700,color:'#333',marginBottom:12}}>🏃 週間走行距離</div>
        {runData.some(d=>d.distance>0)?(
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={runData} margin={{top:5,right:5,left:-20,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E4EA"/>
              <XAxis dataKey="name" tick={{fontSize:8,fill:'#999'}} interval={3}/>
              <YAxis tick={{fontSize:10,fill:'#999'}}/>
              <Tooltip formatter={(v)=>`${v}km`}/>
              <Bar dataKey="distance" radius={[3,3,0,0]} fill="#1565C0"/>
            </BarChart>
          </ResponsiveContainer>
        ):(<div style={{textAlign:'center',padding:24,color:'#ccc',fontSize:13}}>まだ記録がありません</div>)}
      </div>
      {/* Weight Input */}
      {currentWeek&&!hasWeight&&(
        <div style={{background:'linear-gradient(135deg,#F0F2F5,#fff)',borderRadius:14,padding:16,border:'1px solid #E0E4EA',marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:10}}>⚖️ Week {currentWeek.week} の体重記録</div>
          <div style={{display:'flex',gap:8,marginBottom:8}}>
            <input type="number" step="0.1" placeholder="kg" value={wInput} onChange={e=>setWInput(e.target.value)} style={{flex:1,padding:'10px 12px',borderRadius:10,border:'1px solid #ddd',fontSize:14,outline:'none'}}/>
            <button onClick={saveWeight} style={{padding:'10px 18px',background:'#4A90D9',color:'#fff',border:'none',borderRadius:10,fontSize:13,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>記録</button>
          </div>
          <input type="text" placeholder="メモ（任意）" value={mInput} onChange={e=>setMInput(e.target.value)} style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid #ddd',fontSize:13,outline:'none',boxSizing:'border-box'}}/>
        </div>
      )}
      {/* Run Input */}
      {currentWeek&&!hasRun&&(
        <div style={{background:'linear-gradient(135deg,#E3F2FD,#fff)',borderRadius:14,padding:16,border:'1px solid #E0E4EA'}}>
          <div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:10}}>🏃 Week {currentWeek.week} のラン記録</div>
          <div style={{display:'flex',gap:8,marginBottom:8}}>
            <input type="number" step="0.1" placeholder="週間距離 (km)" value={rDist} onChange={e=>setRDist(e.target.value)} style={{flex:1,padding:'10px 12px',borderRadius:10,border:'1px solid #ddd',fontSize:14,outline:'none'}}/>
            <input type="number" step="0.1" placeholder="最長 (km)" value={rLong} onChange={e=>setRLong(e.target.value)} style={{flex:1,padding:'10px 12px',borderRadius:10,border:'1px solid #ddd',fontSize:14,outline:'none'}}/>
          </div>
          <button onClick={saveRun} style={{width:'100%',padding:'10px',background:'#1565C0',color:'#fff',border:'none',borderRadius:10,fontSize:13,fontWeight:600,cursor:'pointer'}}>記録</button>
        </div>
      )}
    </div>
  );
};

// ─── Share Tab ────────────────────────────────────────────────────────────────
const ShareTab = ({checks,weights,cheers}) => {
  const [displayName,setDisplayName]=useState(''); const [message,setMessage]=useState('');
  const [shareWeight,setShareWeight]=useState(false); const [copied,setCopied]=useState(false);
  useEffect(()=>{(async()=>{const s=await storageGet('share-settings');if(s){setDisplayName(s.name||'');setMessage(s.message||'');setShareWeight(!!s.shareWeight);}})();},[]);
  const currentWeek=getCurrentWeek(); const todayStr=toDateStr(today());
  const dc=checks[todayStr]||{}; const items=currentWeek?getItemsForWeek(currentWeek):[];
  const todayRate=items.length>0?Math.round((items.filter(it=>dc[it.key]).length/items.length)*100):0;
  const streak=useMemo(()=>{let c=0;const d=new Date(today());while(true){const ds=toDateStr(d);if(isTravel(ds)){d.setDate(d.getDate()-1);continue;}const wk=getWeekForDate(ds);const dch=checks[ds];if(wk&&dch&&calcDayRate(dch,wk)>=0.5){c++;d.setDate(d.getDate()-1);continue;}break;}return c;},[checks]);

  const save=async(name,msg,sw)=>{
    await storageSet('share-settings',{name,message:msg,shareWeight:sw});
    const weeklyRates=WEEKS_DATA.map(w=>{const s=parseDate(w.startDate),e=new Date(Math.min(parseDate(w.endDate).getTime(),today().getTime()));if(s>today())return 0;let tr=0,days=0;const d=new Date(s);while(d<=e){const ds=toDateStr(d);const dc2=checks[ds];if(dc2){tr+=calcDayRate(dc2,w);days++;}d.setDate(d.getDate()+1);}return days>0?Math.round((tr/days)*100):0;});
    const wts=sw?Object.entries(weights).map(([k,v])=>({week:parseInt(k.replace('week-','')),weight:v.weight})):[];
    await storageSet('shared-progress',{lastUpdated:new Date().toISOString(),currentWeek:currentWeek?.week,phase:currentWeek?.phase,todayRate,streak,weeklyRates,weights:wts,message:msg,name:name||'パートナー'},true);
  };

  const handleCopy=async()=>{await save(displayName,message,shareWeight);const url=window.location.href.split('?')[0]+'?view=partner';try{await navigator.clipboard.writeText(url);}catch{}setCopied(true);setTimeout(()=>setCopied(false),2000);};
  const phaseColor=currentWeek?PHASE_COLORS[currentWeek.phase.number]:'#4A90D9';
  return (
    <div style={{padding:'20px 16px'}}>
      <div style={{textAlign:'center',marginBottom:20}}><div style={{fontSize:28,marginBottom:4}}>💌</div><div style={{fontSize:18,fontWeight:700,color:'#333'}}>パートナーに共有</div></div>
      {cheers>0&&(<div style={{textAlign:'center',background:'linear-gradient(135deg,#E3F2FD,#F0F2F5)',padding:14,borderRadius:14,marginBottom:16,border:'1px solid #E0E4EA'}}><span style={{fontSize:18}}>💐</span> <span style={{fontSize:14,fontWeight:600,color:'#1565C0'}}>パートナーから {cheers}回 応援されました！</span></div>)}
      <div style={{background:'#fff',borderRadius:16,padding:16,border:'1px solid #E0E4EA',marginBottom:16}}>
        <div style={{marginBottom:14}}><label style={{fontSize:13,fontWeight:600,color:'#666',marginBottom:6,display:'block'}}>👤 表示名</label><input type="text" maxLength={20} value={displayName} onChange={e=>setDisplayName(e.target.value)} onBlur={()=>save(displayName,message,shareWeight)} placeholder="名前を入力" style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid #ddd',fontSize:14,outline:'none',boxSizing:'border-box'}}/></div>
        <div style={{marginBottom:14}}><label style={{fontSize:13,fontWeight:600,color:'#666',marginBottom:6,display:'block'}}>💬 今日の一言</label><input type="text" maxLength={50} value={message} onChange={e=>setMessage(e.target.value)} onBlur={()=>save(displayName,message,shareWeight)} placeholder="例: 今日も頑張った！💪" style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid #ddd',fontSize:14,outline:'none',boxSizing:'border-box'}}/></div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:600,color:'#666'}}>⚖️ 体重を共有</span>
          <button onClick={()=>{const nv=!shareWeight;setShareWeight(nv);save(displayName,message,nv);}} style={{width:48,height:26,borderRadius:13,border:'none',cursor:'pointer',position:'relative',background:shareWeight?'#4A90D9':'#ddd',transition:'background 0.3s'}}><div style={{width:20,height:20,borderRadius:10,background:'#fff',position:'absolute',top:3,left:shareWeight?25:3,transition:'left 0.3s',boxShadow:'0 1px 3px rgba(0,0,0,0.2)'}}/></button>
        </div>
      </div>
      <button onClick={handleCopy} style={{width:'100%',padding:'16px',background:copied?'#2E7D32':'linear-gradient(135deg,#4A90D9,#1565C0)',color:'#fff',border:'none',borderRadius:14,fontSize:15,fontWeight:700,cursor:'pointer',transition:'all 0.3s',boxShadow:'0 4px 15px rgba(74,144,217,0.3)'}}>
        {copied?'✅ コピーしました！':'📤 共有リンクをコピー'}
      </button>
    </div>
  );
};

// ─── Partner View ────────────────────────────────────────────────────────────
const PartnerView = () => {
  const [data,setData]=useState(null); const [loading,setLoading]=useState(true); const [cheered,setCheered]=useState(false);
  useEffect(()=>{(async()=>{const d=await storageGet('shared-progress',true);setData(d);setLoading(false);})();},[]);
  const handleCheer=async()=>{if(cheered)return;const cur=await storageGet('shared-cheers',true);const count=cur?cur.count+1:1;await storageSet('shared-cheers',{count},true);setCheered(true);};
  if(loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#F5F6FA'}}><div style={{fontSize:24}}>🏆 読み込み中...</div></div>;
  if(!data) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#F5F6FA',flexDirection:'column',gap:12}}><div style={{fontSize:40}}>🏆</div><div style={{fontSize:16,color:'#999'}}>まだ共有データがありません</div></div>;
  const phaseColor=PHASE_COLORS[data.phase?.number||1];
  return (
    <div style={{minHeight:'100vh',background:'#F5F6FA',maxWidth:480,margin:'0 auto'}}>
      <div style={{background:`linear-gradient(180deg,${phaseColor}20,#F5F6FA)`,padding:'28px 20px 20px'}}>
        <div style={{textAlign:'center'}}><div style={{fontSize:20,fontWeight:800,color:'#333'}}>🏆 {data.name||'パートナー'}の頑張りレポート</div></div>
      </div>
      <div style={{padding:'0 20px 30px'}}>
        <div style={{textAlign:'center',margin:'16px 0'}}><ProgressRing pct={data.todayRate||0} size={110} color={phaseColor}/><div style={{fontSize:14,fontWeight:700,color:phaseColor,marginTop:8}}>{data.phase?.emoji} Phase {data.phase?.number} — Week {data.currentWeek}/39</div></div>
        {data.message&&(<div style={{background:'#fff',padding:'16px 18px',borderRadius:14,marginBottom:16,textAlign:'center',border:'1px solid #E0E4EA',fontSize:15}}>💬 {data.message}</div>)}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
          <div style={{background:'#fff',borderRadius:12,padding:14,textAlign:'center',border:'1px solid #E0E4EA'}}><div style={{fontSize:20,fontWeight:800,color:'#E65100'}}>{data.streak||0}</div><div style={{fontSize:11,color:'#999'}}>🔥 連続日数</div></div>
          <div style={{background:'#fff',borderRadius:12,padding:14,textAlign:'center',border:'1px solid #E0E4EA'}}><div style={{fontSize:20,fontWeight:800,color:'#F9A825'}}>{data.perfectDays||0}</div><div style={{fontSize:11,color:'#999'}}>⭐ 完全達成</div></div>
          <div style={{background:'#fff',borderRadius:12,padding:14,textAlign:'center',border:'1px solid #E0E4EA'}}><div style={{fontSize:20,fontWeight:800,color:'#4A90D9'}}>{data.totalChecked||0}</div><div style={{fontSize:11,color:'#999'}}>✅ チェック</div></div>
        </div>
        <button onClick={handleCheer} style={{width:'100%',padding:'16px',background:cheered?'#2E7D32':'linear-gradient(135deg,#4A90D9,#1565C0)',color:'#fff',border:'none',borderRadius:14,fontSize:16,fontWeight:700,cursor:cheered?'default':'pointer',transition:'all 0.3s'}}>
          {cheered?'💐 応援しました！':'💐 応援する！'}
        </button>
      </div>
    </div>
  );
};

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const isPartner = typeof window!=='undefined'&&window.location.search.includes('view=partner');
  if(isPartner) return <PartnerView/>;

  const [tab,setTab]=useState('today');
  const [checks,setChecks]=useState({});
  const [weights,setWeights]=useState({});
  const [runLog,setRunLog]=useState({});
  const [cheers,setCheers]=useState(0);
  const [showSettings,setShowSettings]=useState(false);
  const [reminderSettings,setReminderSettings]=useState({enabled:false,morningTime:'05:00',eveningTime:'22:00'});
  const [showConfetti,setShowConfetti]=useState(false);
  const [loading,setLoading]=useState(true);
  const reminderRef=useRef(null); const firedRef=useRef({});
  const weekData=getCurrentWeek();

  useEffect(()=>{(async()=>{
    const c=await storageGet('checks'); const w=await storageGet('weights');
    const r=await storageGet('reminder-settings'); const ch=await storageGet('shared-cheers',true);
    const rl=await storageGet('run-log');
    if(c)setChecks(c); if(w)setWeights(w); if(r)setReminderSettings(r); if(ch)setCheers(ch.count||0); if(rl)setRunLog(rl);
    setLoading(false);
  })();},[]);

  useEffect(()=>{
    if(reminderRef.current)clearInterval(reminderRef.current);
    if(!reminderSettings.enabled||!('Notification' in window)||Notification.permission!=='granted')return;
    reminderRef.current=setInterval(()=>{
      const now=new Date(); const hhmm=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      const todayKey=toDateStr(now);
      const checkAndFire=(time,type)=>{const firedKey=`${todayKey}-${type}`;if(hhmm===time&&!firedRef.current[firedKey]){firedRef.current[firedKey]=true;const wk=getCurrentWeek();if(!wk)return;const title=type==='morning'?'🌅 おはよう！今日のToDoを確認しよう':'🌙 今日のチェックは済んだ？';new Notification(title,{body:`Week ${wk.week} — ${wk.phase.emoji} ${wk.phase.name}`});}};
      checkAndFire(reminderSettings.morningTime,'morning'); checkAndFire(reminderSettings.eveningTime,'evening');
      Object.keys(firedRef.current).forEach(k=>{if(!k.startsWith(todayKey))delete firedRef.current[k];});
    },30000);
    return ()=>{if(reminderRef.current)clearInterval(reminderRef.current);};
  },[reminderSettings,checks]);

  const handleCheck=useCallback(async(dateStr,itemKey,value)=>{
    setChecks(prev=>{
      const next={...prev,[dateStr]:{...(prev[dateStr]||{}),[itemKey]:value}};
      storageSet('checks',next);
      const wk=getWeekForDate(dateStr);
      if(wk&&dateStr===toDateStr(today())){const items=getItemsForWeek(wk);const allDone=items.every(it=>(it.key===itemKey?value:!!next[dateStr]?.[it.key]));if(allDone&&value){setShowConfetti(true);setTimeout(()=>setShowConfetti(false),3500);}}
      return next;
    });
  },[]);

  const handleWeightSave=useCallback(async(weekNum,weight,memo)=>{setWeights(prev=>{const next={...prev,[`week-${weekNum}`]:{weight,memo,recordedAt:toDateStr(today())}};storageSet('weights',next);return next;});},[]);
  const handleRunSave=useCallback(async(weekNum,distance,longest)=>{setRunLog(prev=>{const next={...prev,[`week-${weekNum}`]:{distance,longest,recordedAt:toDateStr(today())}};storageSet('run-log',next);return next;});},[]);
  const handleSaveSettings=useCallback(async(s)=>{setReminderSettings(s);await storageSet('reminder-settings',s);},[]);

  if(loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#F5F6FA'}}><div style={{textAlign:'center'}}><div style={{fontSize:40,marginBottom:8,animation:'pulse 1.5s ease infinite'}}>🏆</div><div style={{fontSize:14,color:'#999'}}>読み込み中...</div></div></div>;

  const TABS=[{id:'today',icon:'✅',label:'Today'},{id:'history',icon:'📅',label:'History'},{id:'progress',icon:'📊',label:'Progress'},{id:'share',icon:'💌',label:'Share'}];

  return (
    <div style={{minHeight:'100vh',background:'#F5F6FA',maxWidth:480,margin:'0 auto',position:'relative',fontFamily:'"Helvetica Neue",Arial,"Hiragino Kaku Gothic ProN","Hiragino Sans",Meiryo,sans-serif'}}>
      <style>{`
        @keyframes confettiFall { 0%{opacity:1;transform:translateY(0) rotate(0deg);} 100%{opacity:0;transform:translateY(100vh) rotate(720deg);} }
        @keyframes pulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.15);} }
        *{-webkit-tap-highlight-color:transparent;box-sizing:border-box;} input:focus,select:focus,button:focus{outline:none;}
      `}</style>
      <Confetti active={showConfetti}/>
      <div style={{paddingBottom:72}}>
        {tab==='today'&&<TodayTab checks={checks} onCheck={handleCheck} weekData={weekData} onOpenSettings={()=>setShowSettings(true)}/>}
        {tab==='history'&&<HistoryTab checks={checks}/>}
        {tab==='progress'&&<ProgressTab checks={checks} weights={weights} runLog={runLog} onWeightSave={handleWeightSave} onRunSave={handleRunSave}/>}
        {tab==='share'&&<ShareTab checks={checks} weights={weights} cheers={cheers}/>}
      </div>
      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:480,background:'rgba(255,255,255,0.92)',backdropFilter:'blur(12px)',borderTop:'1px solid #E0E4EA',display:'flex',padding:'6px 0 env(safe-area-inset-bottom, 8px)',zIndex:50}}>
        {TABS.map(t=>{const active=tab===t.id;return(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'8px 0',background:'none',border:'none',cursor:'pointer',transition:'all 0.2s'}}>
            <span style={{fontSize:20,filter:active?'none':'grayscale(0.6)',transition:'filter 0.2s'}}>{t.icon}</span>
            <span style={{fontSize:10,fontWeight:active?700:500,color:active?'#4A90D9':'#bbb',transition:'color 0.2s'}}>{t.label}</span>
            {active&&<div style={{width:4,height:4,borderRadius:2,background:'#4A90D9',marginTop:1}}/>}
          </button>
        );})}
      </div>
      <SettingsModal show={showSettings} onClose={()=>setShowSettings(false)} settings={reminderSettings} onSave={handleSaveSettings}/>
    </div>
  );
}
