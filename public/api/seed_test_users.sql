-- =============================================
-- Seed Data for Easy Login (Staff / HR / Manager)
-- Password: 123 for all accounts
-- Run this in phpMyAdmin SQL tab
-- =============================================

-- Step 1: Insert Roles (if not exist)
INSERT IGNORE INTO Role (RoleID, Type) VALUES (1, 'Manager');
INSERT IGNORE INTO Role (RoleID, Type) VALUES (2, 'Staff');
INSERT IGNORE INTO Role (RoleID, Type) VALUES (3, 'HR');

-- Step 2: Delete existing test users if any (to avoid duplicate errors)
DELETE FROM Employee WHERE Email IN ('manager@wcdonald.com', 'hr@wcdonald.com', 'staff@wcdonald.com');

-- Step 3: Insert Manager Account
INSERT INTO Employee (
    RoleID, Name, ICNumber, DateOfBirth, Gender, ContactNumber, Email,
    Position, EmploymentType, HiringDate, EmploymentStatus,
    BankName, BankAccountNumber, PasswordHash
) VALUES (
    1, 'manager', '900101-01-0001', '1990-01-01', 'Male', '012-1111111', 'manager@wcdonald.com',
    'Manager', 'Full-Time', '2024-01-01', 'Active',
    'Maybank', '1234567890', '123'
);

-- Step 4: Insert HR Account
INSERT INTO Employee (
    RoleID, Name, ICNumber, DateOfBirth, Gender, ContactNumber, Email,
    Position, EmploymentType, HiringDate, EmploymentStatus,
    BankName, BankAccountNumber, PasswordHash
) VALUES (
    3, 'hr', '900202-02-0002', '1990-02-02', 'Female', '012-2222222', 'hr@wcdonald.com',
    'HR Officer', 'Full-Time', '2024-01-01', 'Active',
    'CIMB', '2345678901', '123'
);

-- Step 5: Insert Staff Account
INSERT INTO Employee (
    RoleID, Name, ICNumber, DateOfBirth, Gender, ContactNumber, Email,
    Position, EmploymentType, HiringDate, EmploymentStatus,
    BankName, BankAccountNumber, PasswordHash
) VALUES (
    2, 'staff', '900303-03-0003', '1990-03-03', 'Male', '012-3333333', 'staff@wcdonald.com',
    'Crew Member', 'Full-Time', '2024-01-01', 'Active',
    'Public Bank', '3456789012', '123'
);

-- =============================================
-- Login Credentials:
-- | Username  | Password | Role    |
-- | manager   | 123      | Manager |
-- | hr        | 123      | HR      |
-- | staff     | 123      | Staff   |
-- =============================================
