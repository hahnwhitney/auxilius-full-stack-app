-- Accounts created before passwords were required have password_hash = ''.
-- They cannot be authenticated, so remove them to allow re-registration.
DELETE FROM users WHERE password_hash = '';
