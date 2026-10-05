<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function respond(int $status, array $data): void { http_response_code($status); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }
$supabaseUrl = 'https://hxdpdtgamxigobobgzaf.supabase.co';
$supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZHBkdGdhbXhpZ29ib2JnemFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5MTU3MDIsImV4cCI6MjEwNjQ5MTcwMn0.30T2WmAMWnA6V8hQScNhJt9DbHkMC5l8geKQBhNQBTo'; // Clave pública: nunca usar service_role aquí.
$origins = ['https://apostolica.com.ar', 'https://www.apostolica.com.ar', 'http://localhost:8443', 'http://localhost:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
 if (!in_array($origin, $origins, true)) respond(403, ['error'=>'Origen no permitido.']);
 header('Access-Control-Allow-Origin: '.$origin); header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method === 'OPTIONS') { http_response_code(204); exit; }
if ($method !== 'POST') respond(405, ['error'=>'Usá POST desde el administrador para subir certificados.']);
$auth = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
if (!$auth && function_exists('getallheaders')) foreach (getallheaders() as $k=>$v) if (strtolower($k)==='authorization') $auth=$v;
if (!preg_match('/^Bearer\s+(\S+)$/i', $auth, $matches)) respond(401, ['error'=>'Falta la sesión del administrador.']);
if (!function_exists('curl_init') || !class_exists('finfo')) respond(500, ['error'=>'Habilitá las extensiones PHP cURL y fileinfo.']);
$curl=curl_init($supabaseUrl.'/auth/v1/user');
curl_setopt_array($curl,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_CONNECTTIMEOUT=>5,CURLOPT_TIMEOUT=>15,CURLOPT_HTTPHEADER=>['apikey: '.$supabaseAnonKey,'Authorization: Bearer '.$matches[1]]]);
$raw=curl_exec($curl);$status=(int)curl_getinfo($curl,CURLINFO_HTTP_CODE);curl_close($curl);
if ($raw===false || $status===0 || $status>=500) respond(502,['error'=>'No se pudo verificar la sesión. Intentá nuevamente.']);
if ($status!==200) respond(401,['error'=>'Sesión inválida o vencida.']);
$user=json_decode($raw,true);
if (empty($user['id']) || ($user['app_metadata']['role']??'')!=='admin') respond(403,['error'=>'Se requiere una cuenta administradora.']);
if (!$_POST && !$_FILES && (int)($_SERVER['CONTENT_LENGTH']??0)>0) respond(413,['error'=>'La carga supera post_max_size de PHP. Configurá post_max_size=24M y upload_max_filesize=20M.']);
$year=filter_var($_POST['year']??null,FILTER_VALIDATE_INT,['options'=>['min_range'=>1900,'max_range'=>2200]]);
if ($year===false) respond(400,['error'=>'Año de egreso inválido.']);
$file=$_FILES['file']??null;
if (!is_array($file) || !isset($file['error']) || is_array($file['error'])) respond(400,['error'=>'Falta el archivo PDF.']);
if (in_array($file['error'],[UPLOAD_ERR_INI_SIZE,UPLOAD_ERR_FORM_SIZE],true)) respond(413,['error'=>'El PDF supera el límite de carga del servidor.']);
if ($file['error']!==UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) respond(400,['error'=>'No se recibió correctamente el archivo.']);
$size=filesize($file['tmp_name']);
if (!$size || $size>20*1024*1024) respond(413,['error'=>'El PDF debe pesar entre 1 byte y 20 MB.']);
$mime=(new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
$handle=fopen($file['tmp_name'],'rb');$signature=$handle?fread($handle,5):'';if ($handle) fclose($handle);
if ($mime!=='application/pdf' || $signature!=='%PDF-') respond(400,['error'=>'El archivo debe ser un PDF válido.']);
$directory=dirname(__DIR__).'/IBAADoc/'.$year;
if (!is_dir($directory) && !mkdir($directory,0755,true) && !is_dir($directory)) respond(500,['error'=>'No se pudo crear la carpeta de certificados.']);
try { $filename='certificado-'.bin2hex(random_bytes(16)).'.pdf'; } catch (Throwable $e) { respond(500,['error'=>'No se pudo crear el nombre del archivo.']); }
if (!move_uploaded_file($file['tmp_name'],$directory.'/'.$filename)) respond(500,['error'=>'No se pudo guardar el certificado. Revisá los permisos de IBAADoc.']);
chmod($directory.'/'.$filename,0644);
respond(201,['ok'=>true,'url'=>'https://apostolica.com.ar/IBAADoc/'.$year.'/'.$filename]);
