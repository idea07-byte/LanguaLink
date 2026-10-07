-- Initial default languages for LinguaLink
INSERT INTO languages (code, name, flag) VALUES
    ('en', 'English', '🇺🇸'),
    ('es', 'Spanish', '🇪🇸'),
    ('fr', 'French', '🇫🇷'),
    ('de', 'German', '🇩🇪'),
    ('ja', 'Japanese', '🇯🇵'),
    ('ko', 'Korean', '🇰🇷'),
    ('zh', 'Mandarin', '🇨🇳'),
    ('it', 'Italian', '🇮🇹'),
    ('pt', 'Portuguese', '🇧🇷'),
    ('ar', 'Arabic', '🇸🇦'),
    ('hi', 'Hindi', '🇮🇳'),
    ('ta', 'Tamil', '🇮🇳'),
    ('ru', 'Russian', '🇷🇺')
ON CONFLICT (code) DO NOTHING;
