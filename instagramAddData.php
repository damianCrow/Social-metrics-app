<?php
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

$servername = "localhost";
$username = "root";
$password = "root";
$dbname = "instagram_vine_metrics";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

if($_GET['data'] AND is_array($_GET['data'])) {

	foreach($_GET['data'] AS $cell) {
		
		$sql = "INSERT INTO instagramAccounts (Account_name, Account_number)
		VALUES ('$cell[account]', '$cell[accountId]')";

		$sql_test = "SELECT * FROM instagramAccounts WHERE Account_number = '$cell[accountId]'";

		$test = count($conn->query($sql_test)->fetch_all());

		if($test > 0) {
			echo 'ERROR: The account you are trying to add already exists in the database.';
		}
		else {
			echo 'Account successfully added to database.';
		}
	}
}

if($_GET['accounts']) {

	$sql = "SELECT Account_number FROM instagramAccounts";

	echo json_encode($conn->query($sql)->fetch_all());	
}

if($_POST['data'] AND is_array($_POST['data'])) {

	foreach($_POST['data'] as $cell) {

		$sql = "INSERT INTO instagramRawData (account, posts, likes, comments, followers)

		VALUES ('$cell[username]', '$cell[posts]', '$cell[likes]', '$cell[comments]', '$cell[followers]')";
	}
}

if(is_array($_POST)) {

	if($_POST['username'] != '') {
		
		$sql = "INSERT INTO instagramRawData (account, posts, likes, comments, followers)

		VALUES ('$_POST[username]', '$_POST[posts]', '$_POST[likes]', '$_POST[comments]', '$_POST[followers]')";
	}	
}

$conn->query($sql);

// if($conn->query($sql) === TRUE) {

// 	    echo "New record created successfully ", $conn->insert_id;
// 	} 
// 	else {
		
// 	    echo "Error: " . $sql . "<br>" . $conn->error;
// 	}

$conn->close();

?>