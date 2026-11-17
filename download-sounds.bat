@echo off
chcp 65001 >nul
:: ============================================
:: Script de téléchargement des sons pour ENI-Memory
:: Version hors ligne
:: ============================================

echo.
echo ============================================
echo  Telechargement des fichiers audio pour ENI-Memory
echo ============================================
echo.

:: Vérifier si le dossier sounds existe, sinon le créer
if not exist "ressources\sounds" (
    mkdir "ressources\sounds"
    echo Dossier ressources\sounds cree.
)

echo.
echo Verification de PowerShell...

:: Vérifier si PowerShell est disponible
where powershell >nul 2>&1
if %errorlevel% equ 0 (
    echo PowerShell est disponible, telechargement en cours...
    echo.
    
    :: Utiliser PowerShell pour télécharger les fichiers
    powershell -Command """
    $urls = @{
        'background.mp3' = 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jingle-216.mp3'
        'cardFlip.mp3' = 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3'
        'match.mp3' = 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'
        'victory.mp3' = 'https://assets.mixkit.co/sfx/preview/mixkit-level-up-or-happy-announcement-2058.mp3'
    }
    
    $destination = 'ressources\sounds'
    
    foreach ($entry in $urls.GetEnumerator()) {
        $filename = $entry.Key
        $url = $entry.Value
        $outputPath = Join-Path -Path $destination -ChildPath $filename
        
        Write-Host "Telechargement de $filename..."
        try {
            Invoke-WebRequest -Uri $url -OutFile $outputPath
            Write-Host "  -> OK" -ForegroundColor Green
        } catch {
            Write-Host "  -> ECHEC: $_" -ForegroundColor Red
        }
    }
    """
) else (
    echo PowerShell n'est pas disponible.
    echo Veuillez telecharger manuellement les fichiers depuis:
    echo   ressources\sounds\README.md
    echo.
)

echo.
echo ============================================
echo Telechargement termine !
echo ============================================
echo.
echo Vous pouvez maintenant utiliser le jeu en mode hors ligne.
echo.

:: Afficher la liste des fichiers téléchargés
if exist "ressources\sounds\background.mp3" (
    echo Fichiers telecharges:
    dir /b "ressources\sounds\*.mp3"
) else (
    echo.
    echo Avertissement: Certains fichiers n'ont pas ete telecharges.
    echo Veuillez consulter ressources\sounds\README.md pour des instructions manuelles.
)

echo.
pause
