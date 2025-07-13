<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getTestimonies();
        break;
    
    case 'POST':
        addTestimony();
        break;
    
    case 'DELETE':
        deleteTestimony();
        break;
    
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function getTestimonies() {
    global $pdo;
    
    try {
        $stmt = $pdo->query("SELECT * FROM testimonies ORDER BY created_at DESC");
        $testimonies = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format data sesuai dengan format yang diharapkan frontend
        $formattedTestimonies = array_map(function($testimony) {
            return [
                'id' => $testimony['id'],
                'name' => $testimony['name'],
                'text' => $testimony['text'],
                'rating' => (int)$testimony['rating'],
                'date' => $testimony['created_at']
            ];
        }, $testimonies);
        
        echo json_encode(['success' => true, 'data' => $formattedTestimonies]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Gagal mengambil data testimoni']);
    }
}

function addTestimony() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['name']) || !isset($input['text']) || !isset($input['rating'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Data tidak lengkap']);
        return;
    }
    
    $name = trim($input['name']);
    $text = trim($input['text']);
    $rating = (int)$input['rating'];
    
    if (empty($name) || empty($text) || $rating < 1 || $rating > 5) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Data tidak valid']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("INSERT INTO testimonies (name, text, rating, created_at) VALUES (?, ?, ?, NOW())");
        $stmt->execute([$name, $text, $rating]);
        
        $id = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true, 
            'message' => 'Testimoni berhasil ditambahkan',
            'data' => [
                'id' => $id,
                'name' => $name,
                'text' => $text,
                'rating' => $rating,
                'date' => date('Y-m-d H:i:s')
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Gagal menyimpan testimoni']);
    }
}

function deleteTestimony() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['id']) || !isset($input['admin_password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Data tidak lengkap']);
        return;
    }
    
    if ($input['admin_password'] !== ADMIN_PASSWORD) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Password admin salah']);
        return;
    }
    
    $id = (int)$input['id'];
    
    try {
        $stmt = $pdo->prepare("DELETE FROM testimonies WHERE id = ?");
        $result = $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Testimoni berhasil dihapus']);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Testimoni tidak ditemukan']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Gagal menghapus testimoni']);
    }
}
?>
