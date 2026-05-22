-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: May 22, 2026 at 06:25 PM
-- Server version: 8.0.46
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dictionary_admin`
--

-- --------------------------------------------------------

--
-- Table structure for table `folder_data`
--

CREATE TABLE `folder_data` (
  `idFolder` int NOT NULL,
  `nameFolder` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `colorFolder` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '#EF8CB9',
  `idUser` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `folder_data`
--

-- --------------------------------------------------------

--
-- Table structure for table `meaning_data`
--

CREATE TABLE `meaning_data` (
  `idMeaning` int NOT NULL,
  `content` varchar(300) NOT NULL,
  `type` enum('text','image') NOT NULL DEFAULT 'text',
  `idTerm` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `meaning_data`
--

-- --------------------------------------------------------

--
-- Table structure for table `term_data`
--

CREATE TABLE `term_data` (
  `idTerm` int NOT NULL,
  `content` varchar(100) NOT NULL,
  `addDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `idFolder` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `term_data`
--

-- --------------------------------------------------------

--
-- Table structure for table `user_data`
--

CREATE TABLE `user_data` (
  `idUser` int NOT NULL,
  `username` varchar(30) NOT NULL,
  `password` varchar(250) NOT NULL,
  `recoveryToken` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `tokenConfirmed` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_data`
--

--
-- Indexes for dumped tables
--

--
-- Indexes for table `folder_data`
--
ALTER TABLE `folder_data`
  ADD PRIMARY KEY (`idFolder`),
  ADD UNIQUE KEY `nameFolder` (`nameFolder`,`idUser`),
  ADD KEY `folder_data_ibfk_1` (`idUser`);

--
-- Indexes for table `meaning_data`
--
ALTER TABLE `meaning_data`
  ADD PRIMARY KEY (`idMeaning`),
  ADD KEY `idTerm` (`idTerm`);

--
-- Indexes for table `term_data`
--
ALTER TABLE `term_data`
  ADD PRIMARY KEY (`idTerm`),
  ADD KEY `idFolder` (`idFolder`);

--
-- Indexes for table `user_data`
--
ALTER TABLE `user_data`
  ADD PRIMARY KEY (`idUser`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `folder_data`
--
ALTER TABLE `folder_data`
  MODIFY `idFolder` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `meaning_data`
--
ALTER TABLE `meaning_data`
  MODIFY `idMeaning` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `term_data`
--
ALTER TABLE `term_data`
  MODIFY `idTerm` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `user_data`
--
ALTER TABLE `user_data`
  MODIFY `idUser` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `folder_data`
--
ALTER TABLE `folder_data`
  ADD CONSTRAINT `folder_data_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `user_data` (`idUser`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `meaning_data`
--
ALTER TABLE `meaning_data`
  ADD CONSTRAINT `meaning_data_ibfk_1` FOREIGN KEY (`idTerm`) REFERENCES `term_data` (`idTerm`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `term_data`
--
ALTER TABLE `term_data`
  ADD CONSTRAINT `term_data_ibfk_1` FOREIGN KEY (`idFolder`) REFERENCES `folder_data` (`idFolder`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
