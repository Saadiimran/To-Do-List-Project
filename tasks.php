<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
ini_set('display_errors', '0');
error_reporting(E_ALL);

try {
    require __DIR__ . '/db.php'; // must define $pdo (PDO instance)
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection error', 'detail' => $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$input = json_decode(file_get_contents('php://input'), true); // assoc array or null

function getTasks($pdo, $id = null) {
    if ($id) {
        $stmt = $pdo->prepare('SELECT * FROM tasks WHERE id = ?');
        $stmt->execute([$id]);
        $task = $stmt->fetch(PDO::FETCH_ASSOC);
        return $task ?: null;
    } else {
        $stmt = $pdo->query('SELECT * FROM tasks ORDER BY created_at DESC');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

function createTask($pdo, $data) {
    $title = trim($data['title'] ?? '');
    $priority = $data['priority'] ?? 'low';
    $description = $data['description'] ?? '';

    if ($title === '') {
        http_response_code(422);
        return ['error' => 'Title is required'];
    }

    $stmt = $pdo->prepare('INSERT INTO tasks (title, priority, description) VALUES (?, ?, ?)');
    $stmt->execute([$title, $priority, $description]);

    $id = (int)$pdo->lastInsertId();
    $stmt = $pdo->prepare('SELECT * FROM tasks WHERE id = ?');
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function updateTask($pdo, $id, $data) {
    // allow partial updates
    $fields = [];
    $params = [];

    if (array_key_exists('title', $data)) {
        $fields[] = 'title = :title';
        $params[':title'] = $data['title'];
    }
    if (array_key_exists('priority', $data)) {
        $fields[] = 'priority = :priority';
        $params[':priority'] = $data['priority'];
    }
    if (array_key_exists('description', $data)) {
        $fields[] = 'description = :description';
        $params[':description'] = $data['description'];
    }
    if (array_key_exists('is_done', $data)) {
        $fields[] = 'is_done = :is_done';
        $params[':is_done'] = (int)$data['is_done'];
    }

    if (empty($fields)) {
        http_response_code(400);
        return ['error' => 'No fields to update'];
    }

    $sql = 'UPDATE tasks SET ' . implode(', ', $fields) . ' WHERE id = :id';
    $params[':id'] = $id;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    // return updated row
    $stmt = $pdo->prepare('SELECT * FROM tasks WHERE id = ?');
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function deleteTask($pdo, $id) {
    $stmt = $pdo->prepare('DELETE FROM tasks WHERE id = ?');
    $stmt->execute([$id]);
    return ['deleted' => $id];
}
try {
    switch ($method) {
        case 'GET':
            $result = getTasks($pdo, $id);
            // if single and not found, return 404
            if ($id && $result === null) {
                http_response_code(404);
                echo json_encode(['error' => 'Task not found']);
                exit;
            }
            echo json_encode($result);
            break;

        case 'POST':
            $result = createTask($pdo, $input ?? []);
            if (isset($result['error'])) {
                // createTask already sets 422 for validation
                echo json_encode($result);
                exit;
            }
            http_response_code(201);
            echo json_encode($result);
            break;

        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID required for PUT']);
                exit;
            }
            $result = updateTask($pdo, $id, $input ?? []);
            echo json_encode($result);
            break;

        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID required for DELETE']);
                exit;
            }
            echo json_encode(deleteTask($pdo, $id));
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'detail' => $e->getMessage()]);
    exit;
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'detail' => $e->getMessage()]);
    exit;
}
