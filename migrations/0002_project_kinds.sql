ALTER TABLE projects ADD COLUMN project_kind TEXT NOT NULL DEFAULT 'tool';
ALTER TABLE projects ADD COLUMN source_url TEXT;
ALTER TABLE projects ADD COLUMN windows_url TEXT;
ALTER TABLE projects ADD COLUMN android_url TEXT;
ALTER TABLE projects ADD COLUMN ios_url TEXT;

UPDATE projects
SET project_kind='tool'
WHERE id IN(
'veylith',
'zevryth',
'lexyra',
'notiva',
'notificator',
'marvills-manager'
);

UPDATE projects
SET project_kind='common'
WHERE id='ceonix';
