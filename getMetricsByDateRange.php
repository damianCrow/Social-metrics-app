<?php

// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

$servername = "localhost";
$username = "root";
$password = "root";
$dbname = "instagram_vine_metrics";

$startDate = $_GET['start'];
$endDate = $_GET['end'];

$conn = new mysqli($servername, $username, $password, $dbname);

$sql = "SELECT * FROM instagramRawData WHERE Date_stamp >= '$startDate' AND Date_stamp <= '$endDate' ORDER BY Date_stamp DESC";

$sql_limit = "SELECT Account_number FROM instagramAccounts";

$result5 = count($conn->query($sql_limit)->fetch_all());

$sql_previous_date = "SELECT * FROM instagramRawData WHERE (Date_stamp <= '$startDate') ORDER BY Date_stamp DESC LIMIT $result5";

$sql2 = "SELECT * FROM vineRawData WHERE Date_stamp >= '$startDate' AND Date_stamp <= '$endDate' ORDER BY Date_stamp DESC";

$sql2_limit = "SELECT Account_number FROM VineAccounts";

$result6 = count($conn->query($sql2_limit)->fetch_all());

$sql2_previous_date = "SELECT * FROM vineRawData WHERE (Date_stamp <= '$startDate') ORDER BY Date_stamp DESC LIMIT $result6";


$result = $conn->query($sql)->fetch_all();
$result2 = $conn->query($sql2)->fetch_all();
$result3 = $conn->query($sql_previous_date)->fetch_all();
$result4 = $conn->query($sql2_previous_date)->fetch_all();

echo json_encode(array($result, $result3, $result2, $result4));

$conn->close();

?>