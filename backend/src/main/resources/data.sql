-- Initial default languages for LinguaLink (Complete Multi-Language Dataset)
INSERT INTO languages (code, name, flag) VALUES
    ('en', 'English', '🇺🇸'),
    ('ta', 'Tamil', '🇮🇳'),
    ('hi', 'Hindi', '🇮🇳'),
    ('te', 'Telugu', '🇮🇳'),
    ('ml', 'Malayalam', '🇮🇳'),
    ('kn', 'Kannada', '🇮🇳'),
    ('bn', 'Bengali', '🇮🇳'),
    ('mr', 'Marathi', '🇮🇳'),
    ('es', 'Spanish', '🇪🇸'),
    ('fr', 'French', '🇫🇷'),
    ('de', 'German', '🇩🇪'),
    ('ja', 'Japanese', '🇯🇵'),
    ('ko', 'Korean', '🇰🇷'),
    ('zh', 'Chinese', '🇨🇳'),
    ('ar', 'Arabic', '🇸🇦'),
    ('pt', 'Portuguese', '🇧🇷'),
    ('ru', 'Russian', '🇷🇺'),
    ('it', 'Italian', '🇮🇹')
ON CONFLICT (code) DO NOTHING;
