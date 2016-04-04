<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$servername = "localhost";
$username = "root";
$password = "root";
$dbname = "instagram_vine_metrics";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {

    die("Connection failed: " . $conn->connect_error);
} 

$sql = "CREATE TABLE vineRawData (
id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
Date_Stamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
Region VARCHAR(40) NOT NULL,
Posts VARCHAR(15),
Loop_Count VARCHAR(50),
Revines VARCHAR(30),
Comments VARCHAR(30),
Likes VARCHAR(30),
Followers VARCHAR(30)
)";

$sql2 = "CREATE TABLE instagramRawData (
id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
Date_Stamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
Account VARCHAR(40) NOT NULL,
Posts VARCHAR(50),
Likes VARCHAR(30),
Comments VARCHAR(30),
Followers VARCHAR(30)
)";

$sql3 = "CREATE TABLE instagramAccounts (
id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
Account_Name VARCHAR(40) NOT NULL,
Account_Number VARCHAR(50)
)";

$sql4 = "CREATE TABLE VineAccounts (
id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
Account_Name VARCHAR(40) NOT NULL,
Account_Number VARCHAR(50)
)";

$conn->query($sql3);
$conn->query($sql4);

if ($conn->query($sql) and $conn->query($sql2) === TRUE) {

  echo "tables created successfully";
} 
else {
	
  echo "Error creating database: ";
}


$conn->close();

?>