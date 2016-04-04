<?php

 DEFINE('DB_USERNAME', 'root');
 DEFINE('DB_PASSWORD', 'root');
 DEFINE('DB_HOST', 'localhost');

 $mysqli = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD);

 if (mysqli_connect_error()) {

  die('Connect Error ('.mysqli_connect_errno().') '.mysqli_connect_error());
 }

 $sql = "CREATE DATABASE instagram_vine_metrics";

 if ($mysqli->query($sql) === TRUE) {

  echo "Database created successfully";
} 
else {
	
  echo "Error creating database: ";
}

 $mysqli -> close();

?>