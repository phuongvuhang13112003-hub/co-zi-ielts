# Cozy IELTS – bản web độc lập

Bản này chạy hoàn toàn trên trình duyệt, không cần tài khoản Claude, dùng được cả khi không có mạng sau lần mở đầu tiên.

## Đưa lên GitHub Pages (một lần)
1. Vào github.com → **New repository** → đặt tên, ví dụ `cozy-ielts` → chọn **Public** → Create.
2. Trong repo vừa tạo: **Add file → Upload files** → kéo thả **toàn bộ nội dung** thư mục này (kể cả thư mục `assets`) → **Commit changes**.
3. **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save.
4. Đợi 1–2 phút, link sẽ có dạng `https://<tên-github>.github.io/cozy-ielts/`.

## Cài lên điện thoại / máy tính như app
- Android (Chrome): mở link → menu ⋮ → **Thêm vào màn hình chính / Cài đặt ứng dụng**.
- Máy tính (Chrome/Edge): bấm biểu tượng cài đặt ở cuối thanh địa chỉ.

## Cập nhật bản mới
Upload đè các file mới lên repo (Add file → Upload files). Lần mở app kế tiếp sẽ tải bản mới; app báo "Có bản cập nhật mới" thì đóng và mở lại.

## Dữ liệu
- Mỗi máy lưu dữ liệu riêng trong trình duyệt. Mỗi người học có tài khoản riêng (có thể đặt PIN).
- **Sao lưu**: Tài khoản → Sao lưu & đồng bộ → *Tải file sao lưu*.
- **Đồng bộ giữa các máy (tuỳ chọn)**: tạo token tại GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate → Account permissions: **Gists: Read and write** → dán vào app. Máy đầu tiên để trống Gist ID; app sẽ hiện ID để dán vào máy còn lại.

## Nguồn dữ liệu mở
- CEFR-J Wordlist v1.5 (Tono Laboratory, TUFS) · Octanove Vocabulary Profile C1/C2 (CC BY-SA 4.0)
- Princeton WordNet 3.0 (WordNet License) – định nghĩa, ví dụ, từ đồng nghĩa, danh sách kiểm tra chính tả
- Phông chữ Nunito, Baloo 2, Lora (SIL Open Font License) qua Fontsource
