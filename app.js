/* ============================================



         * Step 3: JSON インポート機能 (AppPlan.md §7.5)



         * ============================================ */







        // --- State (§7.5 冒頭) ---



        var state = {



            title: '',



            totalChapters: 0,



            chapters: [],



            currentChapterIndex: 0,



            theme: 'light'



        };







        // --- DOM refs ---



        var fileInput     = document.getElementById('fileInput');



        var loadingScreen = document.getElementById('loadingScreen');



        var tocOverlay    = document.getElementById('tocOverlay');



        var bookTitleEl   = document.getElementById('bookTitle');



        var tocTitleEl    = document.getElementById('tocTitle');







        // --- Toast helper (§7.5 "エラー表示") ---



        function showToast(msg, duration) {



            duration = duration || 3000;



            var existing = document.querySelector('.toast-msg');



            if (existing) existing.parentNode.removeChild(existing);



            var el = document.createElement('div');



            el.className = 'toast-msg';



            el.textContent = msg;



            el.style.cssText =



                'position:fixed;top:68px;left:50%;transform:translateX(-50%);' +



                'background:rgba(40,40,40,0.92);color:#fff;' +



                'padding:10px 22px;border-radius:8px;font-size:14px;' +



                'z-index:300;pointer-events:none;opacity:0;' +



                'transition:opacity 300ms ease-out;';



            document.body.appendChild(el);



            requestAnimationFrame(function () { el.style.opacity = '1'; });



            setTimeout(function () {



                el.style.opacity = '0';



                setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 350);



            }, duration);



        }







        // --- importJSON (§7.5 コード例) ---



        function importJSON(file) {

            var reader = new FileReader();

            reader.onload = function (e) {

                try {

                    var data = JSON.parse(e.target.result);

                    if (!data || typeof data !== 'object') throw new Error('有効なJSON形式ではありません');


                    // --- State 更新（共通 JSON 形式: flat pages[]） ---
                    state.title = data.title || '';
                    bookTitleEl.textContent = state.title;
                    tocTitleEl.textContent = state.title;

                    // pages → chapters 変換 (共通 JSON 形式)
                    // pages[] は flat で各要素が 1話 (= 1ページ)
                    var allChapters = [];
                    if (Array.isArray(data.pages)) {
                        for (var i = 0; i < data.pages.length; i++) {
                            var page = data.pages[i];
                            if (!page) continue;

                            if (page.chapters && Array.isArray(page.chapters)) {
                                // Pattern A: chapters[] exists - expand each chapter
                                for (var j = 0; j < page.chapters.length; j++) {
                                    var ch = page.chapters[j];
                                    allChapters.push({
                                        id:       ch.id || (allChapters.length + 1),
                                        heading:  ch.heading || page.title || (String.fromCharCode(31532)+(j+1)+String.fromCharCode(35441)),
                                        body:     ch.body || '<p>本文がありません</p>', pageNum: allChapters.length + 1
                                    });
                                }
                            } else {
                                // Pattern B: no chapters - treat page as 1 chapter
                                if (!page.title) continue;
                                allChapters.push({
                                    id:       page.id || (allChapters.length + 1),
                                    heading:  page.title,
                                    body:     page.body || '<p>本文がありません</p>', pageNum: allChapters.length + 1
                                });
                            }
                        }
                    }
                    if (allChapters.length === 0) {
                        throw new Error('有効なデータが見つかりません');
                    }


                    // State 更新
                    state.totalChapters = allChapters.length;
                    state.chapters = allChapters;
                    state.currentChapterIndex = 0;

                    // ローディング画面を隠す
                    loadingScreen.style.display = 'none';

                    showToast('インポート完了 — 全' + state.totalChapters + '話を読み込みました', 2500);
                    renderCurrentChapter();


                } catch (err) {
                    console.error('[importJSON] エラー:', err);
                    showToast('ファイルの読み込みに失敗しました: ' + err.message, 4000);
                    loadingScreen.style.display = 'flex';
                }

            };

            reader.onerror = function () {
                showToast('ファイルの読み込みに失敗しました', 3000);
                loadingScreen.style.display = 'flex';
            };


            reader.readAsText(file, 'UTF-8');
        }

        // --- Event bindings: import button + file input ---



        document.getElementById('btnImport').addEventListener('click', function () {



            fileInput.click();



        });



        fileInput.addEventListener('change', function (e) {



            var file = e.target.files[0];



            if (!file) return;



            importJSON(file);



            // 同じファイルを再選択可能にする



            fileInput.value = '';



        });







        








        /* ============================================


         * Step 4: Chapter Display + Navigation


         * ============================================ */





        function renderCurrentChapter() {


            if (!state.chapters||state.totalChapters===0)return;


            var idx=state.currentChapterIndex;


            if (idx<0)idx=0;


            if (idx>=state.totalChapters)idx=state.totalChapters-1;





            document.getElementById("chapterHeading").textContent=state.chapters[idx].heading;


            document.getElementById("novelBody").innerHTML=state.chapters[idx].body;


            document.getElementById("novelBody").scrollTo(0,0);


            updateNavButtons();


        }





        function goToPrev() {


            if (state.currentChapterIndex>0){


                state.currentChapterIndex--;


                renderCurrentChapter();


            }


        }





        function goToNext() {


            if (state.currentChapterIndex<state.totalChapters-1){


                state.currentChapterIndex++;


                renderCurrentChapter();


            }


        }





        function updateNavButtons() {


            var pb=document.getElementById("btnPrev"),nb=document.getElementById("btnNext"),ct=document.getElementById("navCounter");


            pb.disabled=(state.currentChapterIndex===0);pb.classList.toggle("disabled-state",state.currentChapterIndex===0);


            nb.disabled=(state.currentChapterIndex===state.totalChapters-1);nb.classList.toggle("disabled-state",state.currentChapterIndex===state.totalChapters-1);


            ct.textContent=(state.currentChapterIndex+1)+" / "+state.totalChapters;


        }





        document.getElementById("btnPrev").addEventListener("click",goToPrev);


        document.getElementById("btnNext").addEventListener("click",goToNext);





        document.getElementById("tocOverlay").addEventListener("click",function(e){


            if (e.target===document.getElementById("tocOverlay"))closeTOC();


        });


        document.getElementById("menuOverlay").addEventListener("click",function(e){


            if (e.target===document.getElementById("menuOverlay"))closeMenu();


        });// --- TOC open/close (§4, Step 5 で拡張) ---



        function openTOC() {



            tocTitleEl.textContent = state.title;


            renderTOC();



            tocOverlay.classList.add('active');



        }



        function closeTOC() {



            tocOverlay.classList.remove('active');



        }



        document.getElementById('btnTocHeader').addEventListener('click', openTOC);



        document.getElementById('btnTocNav')  .addEventListener('click', openTOC);



        document.getElementById('btnCloseToc') .addEventListener('click', closeTOC);







        // --- TocItemClick event handler (§7.5: 話選択) ---
        document.getElementById("tocList").addEventListener("click", function (e) {
            var item = e.target.closest(".toc-item");
            if (!item) return;
            var idx = parseInt(item.dataset.index);
            state.currentChapterIndex = idx;
            renderCurrentChapter();
            closeTOC();
        });

        /* ============================================



         * Step 5: 目次機能 (§7.5)



         * ============================================ */







        // --- renderTOC() (§7.5) ---



        function renderTOC() {



            var tocListEl = document.getElementById("tocList");



            if (!tocListEl) return;



            var html = "";



            var dq = String.fromCharCode(34);



            state.chapters.forEach(function(ch, i) {



                var activeClass = (i === state.currentChapterIndex) ? " active" : "";



                var cls = (i === state.currentChapterIndex) ? "toc-item active" : "toc-item";
                html += "<li class=" + dq + cls + dq + " data-index=" + dq + i + dq + ">" + "p" + (i+1) + ": " + ch.heading + "</li>";



            });



            tocListEl.innerHTML = html;











            // アクティブ項目をスクロール領域に表示



            var activeEl = document.querySelector(".toc-item.active");



            if (activeEl) activeEl.scrollIntoView({block: "nearest"});







        }














        /* ============================================


         * Step 6: テーマ切替 + closeMenu (AppPlan.md sec7.6)


         * ============================================ */





        // --- closeMenu helper ---


        function closeMenu() {


            document.getElementById("menuOverlay").classList.remove("active");


        }





        // --- Theme switching with localStorage persistence ---


        function setTheme(theme) {


            state.theme = theme;


            document.documentElement.classList.remove("light", "sepia", "dark");


            if (theme !== "light") {


                document.documentElement.classList.add(theme);


            }


            localStorage.setItem("novelReader_theme", theme);


            updateMenuThemeHighlight();


        }





        function updateMenuThemeHighlight() {


            var ids = ["menuLight", "menuSepia", "menuDark"];


            var themes = ["light", "sepia", "dark"];


            for (var k = 0; k < ids.length; k++) {


                var el = document.getElementById(ids[k]);


                if (!el) continue;


                el.style.fontWeight = (state.theme === themes[k]) ? "700" : "";


                el.style.color = (state.theme === themes[k]) ? "var(--accent)" : "";


            }


        }





        // --- Restore theme from localStorage on startup ---


        var savedTheme = localStorage.getItem("novelReader_theme");


        if (savedTheme && ["light", "sepia", "dark"].indexOf(savedTheme) >= 0) {


            setTheme(savedTheme);


        }





        


        // --- Restore font size from localStorage on startup ---
        var savedFontSize = localStorage.getItem("novelReader_fontSize");
        if (savedFontSize) {
            document.documentElement.style.setProperty("--font-size-base", savedFontSize + "px");
            var novelBodyEl = document.getElementById("novelBody");
            if (novelBodyEl) novelBodyEl.style.fontSize = savedFontSize + 'px';
            var headingEls2 = document.querySelectorAll(".novel-heading");
            for (var j = 0; j < headingEls2.length; j++) {
                headingEls2[j].style.fontSize = savedFontSize + "px";
            }
            var sliderEl2 = document.getElementById("fontSizeSlider");
            if (sliderEl2) sliderEl2.value = parseInt(savedFontSize, 10);
            var labelEl2 = document.getElementById("fontSizeLabel");
            if (labelEl2) labelEl2.textContent = savedFontSize + 'px';
        }
// --- Menu button toggle + theme item click handlers ---


        document.getElementById("btnMenu").addEventListener("click", function () {


            var overlay = document.getElementById("menuOverlay");


            if (overlay.classList.contains("active")) {


                closeMenu();


            } else {


                updateMenuThemeHighlight();


                overlay.classList.add("active");


            }


        });


        document.getElementById("menuLight").addEventListener("click", function () { setTheme("light"); });


        document.getElementById("menuSepia").addEventListener("click", function () { setTheme("sepia"); });


        document.getElementById("menuDark").addEventListener("click", function () { setTheme("dark"); });




        // --- Font size slider input handler ---
        var sliderEl = document.getElementById("fontSizeSlider");
        if (sliderEl) {
            sliderEl.addEventListener("input", function () {
                var size = parseInt(this.value, 10);
                document.documentElement.style.setProperty("--font-size-base", size + "px");
                var novelBodyEl = document.getElementById("novelBody");
                if (novelBodyEl) {
                    novelBodyEl.style.fontSize = size + "px";
                }
                var headingEls = document.querySelectorAll(".novel-heading");
                for (var i = 0; i < headingEls.length; i++) {
                    headingEls[i].style.fontSize = size + "px";
                }
                var labelEl = document.getElementById("fontSizeLabel");
                if (labelEl) labelEl.textContent = size + 'px';
                localStorage.setItem("novelReader_fontSize", size);
            });
        }
