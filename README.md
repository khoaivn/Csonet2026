# Thư viện bài thuyết trình

- `index.html`: trang chọn bài.
- `NCS-csonet2026.html`: bài CSONET gốc, 12 trang.
- `NCS-CD2.html`: Chuyên đề 2, hiện có 1 trang tiêu đề, chưa có nội dung chuyên đề.
- `remote.html`: liên kết cố định điều khiển trên iPhone. Tự tải bài đang mở trên máy tính, dùng chung đăng nhập, vuốt, Laser/Pen và ghi chú.

Đẩy tất cả file cập nhật và file mới lên GitHub Pages. **Publish lại firebase.rules.json** để cho phép trường nhận diện bài thuyết trình mới. Xem [REMOTE-SETUP.md](REMOTE-SETUP.md) để cấu hình đăng nhập riêng tư.

Mở thư viện tại `https://khoaivn.github.io/Csonet2026/`. Mỗi bài vẫn mở trực tiếp bằng đường dẫn tương ứng.

## Open locally

Open `index.html` in your browser. For a local server, run `python3 -m http.server 8000` in this folder, then open http://localhost:8000.

## Publish on GitHub Pages

1. Create a GitHub repository, for example `csonet-presentation`.
2. Upload **the contents of this folder** to the repository root. `index.html` must be at the root, next to `styles.css` and `script.js`.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose your branch (usually `main`) and **/(root)**, then save.
6. When deployment finishes, open the Pages link GitHub shows. It normally looks like `https://YOUR-USERNAME.github.io/csonet-presentation/`.

The empty `.nojekyll` file bypasses Jekyll processing. All asset paths are relative, so the deck works in a repository subpath.

## Controls

- Next / previous: arrow keys, Page Down / Page Up, or the bottom buttons
- Space: next slide (unless a button or link has focus)
- Home / End: first / last slide
- N: toggle speaker notes
- O: slide overview
- F: fullscreen
- Escape: close notes or overview
- Swipe horizontally on touch devices
- Print: use the browser dialog to print or save as PDF, landscape, with browser headers and footers disabled. Print layout is provided, but rendering can vary by browser.
- Direct links: `#1` through `#12`

## Content editing

- Slide content and English speaker notes: `index.html`
- Theme, layout and typography: `styles.css`
- Navigation, quota example, and chart data: `script.js`
- Suggested speaking time totals 15 minutes. Adjust this for your assigned slot.
- The title lists manuscript authors without assuming which author will present. Add a presenter name if desired.

## Source and interpretation

Source: *Streaming Algorithms for Monotone k-Submodular Maximization under Fairness Constraints*, Dung T. Pham, Tan D. Tran, Canh V. Pham, supplied 26-page manuscript. Page and section references appear in speaker notes. This is a presentation of the supplied manuscript, not confirmation of conference publication status. No conference logo or official template is implied.

- The label-allocation illustration and quota counts are illustrative examples.
- Slide 11 uses exact reported objective values only at B = 30, not reconstructed data from the plotted budget sweeps.
- Bars start at zero and share a 650-unit scale across both datasets.
- The mathematical model uses exact value-oracle access. Experiments use Monte Carlo estimates.
- Approximation is in expectation for MPFSA. Quota satisfaction holds for every execution.
- The comparison uses the common epsilon range stated in the paper. For k = 3 and epsilon = 0.1, the MPFSA guarantee is 0.3.
- The paper's experiment artifact: https://github.com/tantdhvan/OP-MPFSA

No PDF manuscript or analytics is bundled. A font stylesheet is loaded from a CDN; optional remote control connects to the Firebase database configured by the presenter.

## iPhone remote control

See [REMOTE-SETUP.md](REMOTE-SETUP.md) for Firebase setup and Internet control. Open the phone icon on the presentation toolbar to create a room, then open its private link on iPhone.

Remote access requires Google sign-in as the owner account. Firebase Authentication Web config is in `firebase-config.js`; publish the matching `firebase.rules.json` to enforce access server-side. See REMOTE-SETUP.md for setup.

Tên file trong liên kết có thể nhập hoa/thường nhờ `404.html` tự chuyển về tên chuẩn. Ví dụ `ncs-csonet2026.html`, `NCS-CSONET2026.HTML` đều chuyển về `NCS-csonet2026.html`; tham số và số trang sau dấu # được giữ nguyên. Cần bật JavaScript trên trình duyệt.

Đường dẫn không tồn tại hoặc nhập sai được `404.html` tự chuyển về `index.html`, là danh sách các bài thuyết trình.
