<?php
// "Soft Failure" + NON-BLOCKING RETRY READ
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

function safe_json_encode($value)
{
    return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE | JSON_PARTIAL_OUTPUT_ON_ERROR);
}

try {
    $dbPath = __DIR__ . '/../data/db.json';
    $db = [];

    if (file_exists($dbPath)) {
        if (function_exists('opcache_invalidate'))
            @opcache_invalidate($dbPath, true);

        $fp = @fopen($dbPath, 'r');
        if ($fp) {
            $locked = false;
            $maxRetries = 5; // 5 * 100ms = 0.5s max wait

            for ($i = 0; $i < $maxRetries; $i++) {
                if (flock($fp, LOCK_SH | LOCK_NB)) { // Non-blocking attempt
                    $locked = true;
                    break;
                }
                usleep(100000); // Wait 100ms
            }

            if ($locked) {
                // Got lock, read file
                $size = fstat($fp)['size'];
                if ($size > 0) {
                    $json = fread($fp, $size);
                    $data = json_decode($json, true);
                    if (is_array($data))
                        $db = $data;
                }
                flock($fp, LOCK_UN);
            } else {
                // Could not lock file (Busy)
                // Return empty DB (safe fallback) or handle error
                // For this app, empty DB prevents crash, data will load next poll
                // Ideally we would return 503, but partial data is safer for protocol/UI
            }
            fclose($fp);
        }
    }

    // --- Logic (Unchanged) ---
    $usersMap = [];
    if (!empty($db['users']) && is_array($db['users'])) {
        foreach ($db['users'] as $u) {
            if (isset($u['id'], $u['name']))
                $usersMap[$u['id']] = $u['name'];
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
        return ($b['count'] ?? 0) - ($a['count'] ?? 0);
    });
    $topIntervals = array_slice($topIntervals, 0, 3);

    $voteRanking = [];
    if (!empty($db['vote_blocks']) && is_array($db['vote_blocks'])) {
        foreach ($db['vote_blocks'] as $vb) {
            $rid = $vb['region_id'] ?? 'unknown';
            $uid = $vb['user_id'] ?? 0;
            $uName = $usersMap[$uid] ?? "Unknown";

            if (!isset($voteRanking[$rid]))
                $voteRanking[$rid] = ['regionId' => $rid, 'count' => 0, 'voters' => []];
            $voteRanking[$rid]['count']++;
            if (!in_array($uName, $voteRanking[$rid]['voters']))
                $voteRanking[$rid]['voters'][] = $uName;
        }
    }
    usort($voteRanking, function ($a, $b) {
        return ($b['count'] ?? 0) - ($a['count'] ?? 0);
    });
    $voteRanking = array_values($voteRanking);

    $userStatuses = [];
    foreach ($usersMap as $uid => $name) {
        $datesCount = 0;
        if (!empty($db['date_selections']))
            foreach ($db['date_selections'] as $d)
                if (($d['user_id'] ?? 0) === $uid)
                    $datesCount++;
        $votesCount = 0;
        if (!empty($db['vote_blocks']))
            foreach ($db['vote_blocks'] as $v)
                if (($v['user_id'] ?? 0) === $uid)
                    $votesCount++;
        $userStatuses[] = ['id' => $uid, 'name' => $name, 'isComplete' => ($datesCount >= 3 && $votesCount >= 1), 'datesCount' => $datesCount, 'votesCount' => $votesCount];
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
                // Csak az utolsó 15 percben aktívakat küldjük el (Passzív szűrés)
                if (($p['lastActive'] ?? 0) >= ($now - 900)) {
                    $userProgress[$uid] = $p;
                }
            }
        }
    }

    echo safe_json_encode([
        "topIntervals" => $topIntervals,
        "voteRanking" => $voteRanking,
        "userStatuses" => $userStatuses,
        "userProgress" => $userProgress
    ]);

} catch (Throwable $e) {
    echo safe_json_encode(["error" => "Server Error", "message" => $e->getMessage()]);
}
exit;