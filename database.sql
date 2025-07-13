-- Database: testimoni_msync

CREATE DATABASE IF NOT EXISTS testimoni_msync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE testimoni_msync;

-- Tabel untuk menyimpan testimoni
CREATE TABLE IF NOT EXISTS testimonies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert beberapa data contoh (opsional)
INSERT INTO testimonies (name, text, rating) VALUES 
('Ahmad Fauzi', 'Matrix Sync sangat membantu dalam sinkronisasi data perusahaan kami. Highly recommended!', 5),
('Sari Dewi', 'Pelayanan yang sangat memuaskan dan responsif. Tim support sangat membantu.', 4),
('Budi Santoso', 'Aplikasi yang user-friendly dan mudah digunakan. Terima kasih Matrix Sync!', 5);
