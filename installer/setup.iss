; Inno Setup Script para Silêncio no PC

[Setup]
AppName=Silêncio no PC
AppVersion=1.0.0
AppPublisher=Controle Parental
DefaultDirName={autopf}\SilencioNoPC
DefaultGroupName=Silêncio no PC
OutputDir=..\dist
OutputBaseFilename=SilencioNoPC_Setup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin

[Files]
Source: "..\dist\SilencioNoPC.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\assets\*"; DestDir: "{app}\assets"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Silêncio no PC"; Filename: "{app}\SilencioNoPC.exe"
Name: "{group}\Desinstalar Silêncio no PC"; Filename: "{uninstallexe}"
Name: "{commondesktop}\Silêncio no PC"; Filename: "{app}\SilencioNoPC.exe"

[Registry]
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "SilencioNoPC"; ValueData: """{app}\SilencioNoPC.exe"""; Flags: uninsdeletevalue

[Run]
Filename: "{app}\SilencioNoPC.exe"; Description: "Iniciar Silêncio no PC"; Flags: nowait postinstall skipifsilent
