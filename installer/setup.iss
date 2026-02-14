; Inno Setup Script para KidsPC

[Setup]
AppName=KidsPC
AppVersion=2.0.0
AppPublisher=Controle Parental
DefaultDirName={autopf}\KidsPC
DefaultGroupName=KidsPC
OutputDir=..\dist
OutputBaseFilename=KidsPC_Setup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin
CloseApplications=force
RestartApplications=yes
AppMutex=KidsPCMutex

[Files]
Source: "..\dist\KidsPC_v2.0.0.exe"; DestDir: "{app}"; DestName: "KidsPC.exe"; Flags: ignoreversion
Source: "..\assets\*"; DestDir: "{app}\assets"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\KidsPC"; Filename: "{app}\KidsPC.exe"
Name: "{group}\Desinstalar KidsPC"; Filename: "{uninstallexe}"
Name: "{commondesktop}\KidsPC"; Filename: "{app}\KidsPC.exe"

[Registry]
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "KidsPC"; ValueData: """{app}\KidsPC.exe"""; Flags: uninsdeletevalue

[Run]
Filename: "{app}\KidsPC.exe"; Description: "Iniciar KidsPC"; Flags: nowait postinstall
