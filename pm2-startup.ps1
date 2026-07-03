$pm2 = (Get-Command pm2).Source
Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "$pm2 resurrect"
