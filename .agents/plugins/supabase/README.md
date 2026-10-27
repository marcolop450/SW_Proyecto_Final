# Conexión Local Supabase MCP (Scope del Proyecto)

Este MCP está configurado exclusivamente para este proyecto dentro de `.agents/plugins/supabase/`. **No afecta a otros proyectos ni a la configuración global de tu máquina.**

## ¿Cómo activarlo con tus credenciales?

1. Abre el archivo `mcp_config.json` en esta misma carpeta:
   `c:\Users\dell\Desktop\SW1\Principal\.agents\plugins\supabase\mcp_config.json`

2. Reemplaza el string de conexión con tu URI de conexión directa o Session Pooler de Supabase:
   - Ve a tu panel de Supabase: **Project Settings > Database > Connection string > URI**
   - Elige el modo **Transaction (puerto 6543)** o **Session (puerto 5432)**
   - Ejemplo:
     ```json
     {
       "mcpServers": {
         "supabase-db": {
           "command": "npx",
           "args": [
             "-y",
             "@modelcontextprotocol/server-postgres",
             "postgresql://postgres:MI_PASSWORD_SECRETA@db.xyzcompany.supabase.co:5432/postgres"
           ]
         }
       }
     }
     ```

3. Guarda el archivo. Antigravity detectará automáticamente las herramientas de base de datos (`query`, `list_tables`, `describe_table`) aisladas para este espacio de trabajo.
