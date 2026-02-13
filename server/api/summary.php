<?php
require 'db.php';

$db = readDB();

// Build Users Map for Name Resolution
$usersMap = [];
if (isset($db['users'])) {
    foreach ($db['users'] as $u) {
        $usersMap[$u['id']] = $u['name'];
    }
}

// 1. Top Intervallumok (date_selections alapján - ez marad a "mikor érünk rá" indikátor) - Updated: 2026-02-13
$intervalCounts = [];

if (isset($db['vote_blocks'])) {
    foreach ($db['vote_blocks'] as $block) {
        $dates = $block['dates']; // Ez már tömb, mert a readDB dekódolja a JSON-t

        if (count($dates) > 0) {
            sort($dates);
            $start = $dates[0];
            $end = $dates[count($dates) - 1];
            $key = "$start|$end";

            if (!isset($intervalCounts[$key])) {
                $intervalCounts[$key] = [
                    'count' => 0,
                    'users' => [],
                    'start' => $start,
                    'end' => $end
                ];
            }
            $intervalCounts[$key]['count']++;

            $uid = $block['user_id'];
            $uName = $usersMap[$uid] ?? "Unknown";
            $intervalCounts[$key]['users'][] = $uName;
        }
    }
}

// Rendezés csökkenő
$topIntervals = array_values($intervalCounts);
usort($topIntervals, function ($a, $b) {
    return $b['count'] - $a['count'];
});
// Top 3
$topIntervals = array_slice($topIntervals, 0, 3);


// 2. Szavazás Rangsor (vote_blocks alapján)
$voteRanking = [];
if (isset($db['vote_blocks'])) {
    foreach ($db['vote_blocks'] as $vb) {
        $rid = $vb['region_id'];
        $uid = $vb['user_id'];
        $uName = $usersMap[$uid] ?? "Unknown";

        if (!isset($voteRanking[$rid])) {
            $voteRanking[$rid] = ['regionId' => $rid, 'count' => 0, 'voters' => []];
        }
        $voteRanking[$rid]['count']++;
        // Egy user többször is szavazhat? Igen. Megjelenítjük többször?
        // Vagy csak unique neveket? Legyen unique név, de a count a lényeg.
        if (!in_array($uName, $voteRanking[$rid]['voters'])) {
            $voteRanking[$rid]['voters'][] = $uName; // Csak egyszer írjuk ki a nevet
        }
    }
}
usort($voteRanking, function ($a, $b) {
    return $b['count'] - $a['count'];
});
$voteRanking = array_values($voteRanking);


// 3. User státuszok
$userStatuses = [];
foreach ($usersMap as $uid => $name) {
    $datesCount = isset($db['date_selections']) ? count(array_filter($db['date_selections'], fn($d) => $d['user_id'] === $uid)) : 0;

    $votesCount = isset($db['vote_blocks']) ? count(array_filter($db['vote_blocks'], fn($v) => $v['user_id'] === $uid)) : 0;

    $userStatuses[] = [
        'id' => $uid,
        'name' => $name,
        'isComplete' => ($datesCount >= 3 && $votesCount >= 1),
        'datesCount' => $datesCount,
        'votesCount' => $votesCount
    ];
}

echo json_encode([
    "topIntervals" => $topIntervals,
    "voteRanking" => $voteRanking,
    "userStatuses" => $userStatuses
]);
?>