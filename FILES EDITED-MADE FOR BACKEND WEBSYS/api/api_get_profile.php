<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "../config/db.php";

$email = $_GET['email'];

$sql = "SELECT 
        contact_first_name,
        contact_middle_initial,
        contact_last_name,
        contact_phone,
        contact_email
        FROM burial_records
        WHERE contact_email = ?
        LIMIT 1";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();

$data = $result->fetch_assoc();

echo json_encode($data);

?>