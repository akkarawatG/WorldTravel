import os

# --- การตั้งค่า (แก้ไขได้ตามต้องการ) ---
OUTPUT_FILE = 'full_project_code.txt'

# โฟลเดอร์ที่จะไม่ดึงข้อมูล (ข้ามพวก Library หรือ Build files)
IGNORE_DIRS = {
    'node_modules', '.git', '.next', '.vscode', '.idea', 
    'venv', '__pycache__', 'dist', 'build', 'coverage',
    'public', # อาจจะเปิดถ้าอยากให้ดู assets แต่ปกติโค้ดสำคัญไม่อยู่ในนี้
    'assets', 'images' 
}

# นามสกุลไฟล์ที่จะไม่ดึงข้อมูล (ข้ามรูปภาพ, binary, หรือไฟล์ที่ไม่ใช่ text)
IGNORE_EXTS = {
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', 
    '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm',
    '.pdf', '.zip', '.tar', '.gz', '.pyc', 
    '.lock', # ข้าม package-lock.json หรือ yarn.lock เพราะมันยาวมาก
    '.ds_store', 'thumbs.db' 
}

# ไฟล์เฉพาะเจาะจงที่อยากข้าม (เช่น ไฟล์ความลับ)
IGNORE_FILES = {
    'package-lock.json', 'yarn.lock', '.env', '.env.local', 'export_code.py'
}

def is_text_file(filename):
    """เช็คเบื้องต้นว่าเป็นไฟล์ Text หรือไม่"""
    return not any(filename.lower().endswith(ext) for ext in IGNORE_EXTS)

def main():
    print(f"กำลังรวบรวมโค้ดลงไฟล์ {OUTPUT_FILE} ...")
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as outfile:
        # เขียน Header บอกวันที่หรือข้อมูลเบื้องต้นได้ตรงนี้
        outfile.write(f"# PROJECT EXPORT\n")
        outfile.write(f"# Date: {os.path.basename(os.getcwd())}\n\n")

        # วนลูปทุกไฟล์ในโฟลเดอร์ปัจจุบัน
        for root, dirs, files in os.walk("."):
            # กรองโฟลเดอร์ที่ไม่ต้องการออกจากการค้นหา
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

            for file in files:
                if file in IGNORE_FILES or not is_text_file(file):
                    continue
                
                # ถ้าไฟล์ที่ export คือไฟล์ output เอง ให้ข้ามไป
                if file == OUTPUT_FILE:
                    continue

                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, ".")

                try:
                    with open(file_path, 'r', encoding='utf-8') as infile:
                        content = infile.read()
                        
                        # เขียนรูปแบบ Header ให้ AI อ่านง่าย
                        outfile.write("=" * 50 + "\n")
                        outfile.write(f"FILE_PATH: {relative_path}\n")
                        outfile.write("=" * 50 + "\n")
                        outfile.write(content + "\n\n")
                        
                        print(f"Added: {relative_path}")
                except Exception as e:
                    print(f"Skipped (Error reading): {relative_path} - {e}")

    print(f"\nเสร็จสิ้น! ข้อมูลทั้งหมดอยู่ในไฟล์: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()