<?php
include 'db.php';
header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

switch ($method) {
    case 'GET':
        // Read all items
        $result = $conn->query("SELECT * FROM work_items");
        $items = [];
        while($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        echo json_encode($items);
        break;
    case 'POST':
        // Create a new item
        $title = $input['title'];
        $description = $input['description'];
        $status = $input['status'];
        $stmt = $conn->prepare("INSERT INTO work_items (title, description, status) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $title, $description, $status);
        $stmt->execute();
        echo json_encode(["message" => "Item created"]);
        break;
    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input || !isset($input['id'])) {
            echo json_encode(["message" => "Invalid input data"]);
            break;
        }
    
        $id = $input['id'];
        $newStatus = $input['status'];
    
        // Fetch existing title and description
        $stmt = $conn->prepare("SELECT title, description FROM work_items WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->bind_result($title, $description);
        $stmt->fetch();
        $stmt->close();
    
        // Use existing title and description if not provided in request
        $title = $input['title'] ?? $title;
        $description = $input['description'] ?? $description;
    
        // Update the item with the provided/new values
        $stmt = $conn->prepare("UPDATE work_items SET title = ?, description = ?, status = ? WHERE id = ?");
        $stmt->bind_param("sssi", $title, $description, $newStatus, $id);
    
        if ($stmt->execute()) {
            echo json_encode(["message" => "Item updated"]);
        } else {
            echo json_encode(["message" => "Error updating item: " . $stmt->error]);
        }
        break;
    case 'DELETE':
        // Delete an item
        $id = $input['id'];
        $conn->query("DELETE FROM work_items WHERE id=$id");
        echo json_encode(["message" => "Item deleted"]);
        break;
}

$conn->close();
?>