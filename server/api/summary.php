<?php
require_once __DIR__ . '/db.php';
sendHeaders();

// Production: disable direct error display
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

function safe_json_encode($value)
{
    return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE | JSON_PARTIAL_OUTPUT_ON_ERROR);
}

try {
    $db = readDB();

    // --- Logic ---
    $usersMap = [];
    if (!empty($db['users']) && is_array($db['users'])) {
        foreach ($db['users'] as $u) {
            if (isset($u['id'], $u['name'])) {
                $usersMap[$u['id']] = $u['name'];
            }
        }
    }

    $intervalCounts = [];
    if (!empty($db['vote_blocks']) && is_array($db['vote_blocks'])) {
        foreach ($db['vote_blocks'] as $block) {
            $dates = $block['dates'] ?? [];
            if (is_array($dates) && count($dates) > 0) {
                sort($dates);
                $key = $dates[0] . '|' . end($dates);
                if (!isset($intervalCounts[$key])) {
                    $intervalCounts[$key] = ['count' => 0, 'users' => [], 'start' => $dates[0], 'end' => end($dates)];
                }
                $intervalCounts[$key]['count']++;
                $uid = $block['user_id'] ?? 0;
                $uName = $usersMap[$uid] ?? "Unknown";
                $intervalCounts[$key]['users'][] = $uName;
            }
        }
    }

    $topIntervals = array_values($intervalCounts);
    usort($topIntervals, function ($a, $b) {
        return (isset($b['count']) ? $b['count'] : 0) - (isset($a['count']) ? $a['count'] : 0);
    });
    $topIntervals = array_slice($topIntervals, 0, 3);

    $voteRanking = [];
    if (!empty($db['vote_blocks']) && is_array($db['vote_blocks'])) {
        foreach ($db['vote_blocks'] as $vb) {
            $rid = isset($vb['region_id']) ? $vb['region_id'] : 'unknown';
            $uid = isset($vb['user_id']) ? $vb['user_id'] : 0;
            $uName = isset($usersMap[$uid]) ? $usersMap[$uid] : "Unknown";

            if (!isset($voteRanking[$rid])) {
                $voteRanking[$rid] = ['regionId' => $rid, 'count' => 0, 'voters' => []];
            }
            $voteRanking[$rid]['count']++;
            if (!in_array($uName, $voteRanking[$rid]['voters'])) {
                $voteRanking[$rid]['voters'][] = $uName;
            }
        }
    }
    usort($voteRanking, function ($a, $b) {
        return ($b['count'] ?? 0) - ($a['count'] ?? 0);
    });
    $voteRanking = array_values($voteRanking);

    $userStatuses = [];
    foreach ($usersMap as $uid => $name) {
        $datesCount = 0;
        if (!empty($db['date_selections'])) {
            foreach ($db['date_selections'] as $d) {
                if ((isset($d['user_id']) ? $d['user_id'] : 0) === $uid) {
                    $datesCount++;
                }
            }
        }
        $votesCount = 0;
        if (!empty($db['vote_blocks'])) {
            foreach ($db['vote_blocks'] as $v) {
                if ((isset($v['user_id']) ? $v['user_id'] : 0) === $uid) {
                    $votesCount++;
                }
            }
        }
        $userStatuses[] = [
            'id' => $uid,
            'name' => $name,
            'isComplete' => ($datesCount >= 3 && $votesCount >= 1),
            'datesCount' => $datesCount,
            'votesCount' => $votesCount
        ];
    }

    // --- Progress Adatok Lekérése (Live haladás) ---
    $progressPath = __DIR__ . '/../data/progress.json';
    $userProgress = [];
    if (file_exists($progressPath)) {
        $pJson = @file_get_contents($progressPath);
        $pData = json_decode($pJson, true);
        if (is_array($pData)) {
            $now = time();
            foreach ($pData as $uid => $p) {
                if ((isset($p['lastActive']) ? $p['lastActive'] : 0) >= ($now - 900)) {
                    $userProgress[$uid] = [
                        'hasDates' => isset($p['hasDates']) ? $p['hasDates'] : false,
                        'regionId' => isset($p['regionId']) ? $p['regionId'] : null,
                        'packageId' => isset($p['packageId']) ? $p['packageId'] : null,
                        'dates' => isset($p['dates']) ? $p['dates'] : [],
                        'lastActive' => isset($p['lastActive']) ? $p['lastActive'] : 0
                    ];
                }
            }
        }
    }

    // --- Részletes Szavazatok ---
    $detailedVotes = [];
    if (!empty($db['vote_blocks']) && is_array($db['vote_blocks'])) {
        foreach ($db['vote_blocks'] as $vb) {
            $ts = isset($vb['created_at']) ? strtotime($vb['created_at']) : 0;
            $detailedVotes[] = [
                "id" => isset($vb['id']) ? $vb['id'] : 0,
                "userId" => isset($vb['user_id']) ? $vb['user_id'] : 0,
                "userName" => isset($usersMap[isset($vb['user_id']) ? $vb['user_id'] : 0]) ? $usersMap[isset($vb['user_id']) ? $vb['user_id'] : 0] : "Ismeretlen",
                "dates" => isset($vb['dates']) ? $vb['dates'] : [],
                "regionId" => isset($vb['region_id']) ? $vb['region_id'] : null,
                "packageId" => isset($vb['package_id']) ? $vb['package_id'] : null,
                "timestamp" => $ts * 1000
            ];
        }
    }
    usort($detailedVotes, function ($a, $b) {
        return (isset($b['timestamp']) ? $b['timestamp'] : 0) - (isset($a['timestamp']) ? $a['timestamp'] : 0);
    });

    echo safe_json_encode([
        "topIntervals" => $topIntervals,
        "voteRanking" => $voteRanking,
        "userStatuses" => $userStatuses,
        "userProgress" => $userProgress,
        "detailedVotes" => $detailedVotes
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo safe_json_encode(["error" => "Server Error", "message" => $e->getMessage()]);
}
exit;
