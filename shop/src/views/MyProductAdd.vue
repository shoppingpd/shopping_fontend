<template>
  <section class="addproduct">
      <main class="main">
        <div class="container">
        <form
            id="product-form"
            enctype="multipart/form-data"
            @submit.prevent="handleSubmit"
            @reset="clearPreview"
        >
            <!-- 商品照片上傳 -->
            <div class="form-group">
            <label for="product-image">商品照片：</label>
            <input
                type="file"
                id="product-image"
                name="productImage"
                accept="image/*"
                required
                @change="previewImage"
            />
            <img
                id="preview-image"
                :src="previewUrl"
                alt="圖片預覽"
                style="max-width: 100%; margin-top: 10px;"
                v-show="previewUrl"
            />
            </div>

            <!-- 商品名稱 -->
            <div class="form-group">
            <label for="product-name">商品名稱：</label>
            <input
                type="text"
                id="product-name"
                name="productName"
                maxlength="100"
                required
            />
            </div>

            <!-- 商品描述 -->
            <div class="form-group">
            <label for="product-description">商品描述：</label>
            <textarea
                id="product-description"
                name="productDescription"
                rows="4"
                required
            ></textarea>
            </div>

            <!-- 商品顏色 -->
            <div class="form-group">
            <label for="product-color">
                商品顏色：(請輸入中文顏色名稱+#色號，例如:黑#000000，多種顏色可以透過,區隔)
            </label>
            <input
                type="text"
                id="product-color"
                name="productColor"
                maxlength="100"
                required
                @blur="validateColor"
            />
            </div>
            <!-- 商品尺寸 -->
            <div class="form-group">
            <label for="product-size">
                商品尺寸：(請使用XS,S,M,L,XL標示，多種尺寸可以透過,區隔)
            </label>
            <input
                type="text"
                id="product-size"
                name="productSize"
                maxlength="45"
                required
                @blur="validateSize"
            />
            </div>

            <!-- 商品售價 -->
            <div class="form-group">
            <label for="product-price">商品售價：</label>
            <input
                type="number"
                id="product-price"
                name="productPrice"
                min="0"
                required
            />
            </div>

            <!-- 商品庫存 -->
            <div class="form-group">
            <label for="product-stock">商品庫存：</label>
            <input
                type="number"
                id="product-stock"
                name="productStock"
                min="0"
                required
            />
            </div>

            <!-- 操作按鈕 -->
            <div class="form-actions">
            <button type="reset">資料清除</button>
            <button type="submit">新增產品</button>
            </div>
        </form>
        </div>
    </main>
  </section>
</template>

<script setup>
  import '@/assets/myshop.css' // 匯入CSS
  import { ref } from 'vue' // 從 Vue 匯入 ref，用來建立響應式資料

    const previewUrl = ref('') // 建立一個響應式變數 previewUrl，用來儲存圖片預覽的 URL。初始值為空字串，代表尚未選擇任何圖片。

    // 定義一個函式 previewImage，當使用者選擇圖片時會被觸發。
    function previewImage(event) {
    const file = event.target.files[0] // 從事件物件中取得使用者選擇的第一個檔案（通常是圖片）。
    // 如果使用者有選擇檔案（不是空的），就執行預覽邏輯。
    if (file) { 
        previewUrl.value = URL.createObjectURL(file)
        // 使用瀏覽器內建的 URL.createObjectURL() 方法，將檔案轉成一個臨時的本地 URL，並指定給 previewUrl 顯示圖片。
    } else {
        previewUrl.value = '' // 如果沒有選擇檔案（例如使用者取消選擇），就清空預覽。
    }}

    // 當使用者點擊「資料清除」按鈕時，清除預覽圖片
    function clearPreview() {
    previewUrl.value = '' // 將圖片預覽的 URL 清空，讓 <img> 消失
    }

    //尺寸欄位的驗證
    function validateSize(event) {

        const input = event.target.value.trim()
        if (input === '') return //空白直接通過，不驗證
        const allowedSizes = ['XS', 'S', 'M', 'L', 'XL']
        const enteredSizes = input.split(',').map(s => s.trim().toUpperCase())

        //檢查是否都是合法尺寸
        const allValid = enteredSizes.every(size => allowedSizes.includes(size))

        //檢查是否有重複值
        const hasDuplicates = new Set(enteredSizes).size !== enteredSizes.length

        if (!allValid || hasDuplicates) {
            alert('尺寸只能輸入不能重複的 XS, S, M, L, XL，且需用逗號分隔')
            event.target.value = '' // 清空欄位
        }
    }

    //色號欄位的驗證
    function validateColor(event) {
        const input = event.target.value.trim()

        if (input === '') return //空白直接通過，不驗證

        // 移除結尾逗號（視為錯誤）
        if (input.endsWith(',')) {
            alert('最後一組顏色後面不能有逗號')
            event.target.value = ''
            return
        }

        const colorItems = input.split(',').map(s => s.trim())

        // 正規表達式：允許「#六位色碼」或「中文+#六位色碼」
        const colorPattern = /^(?:[\u4e00-\u9fa5]+)?#[0-9A-Fa-f]{6}$/

        // 檢查格式是否都正確
        const allValid = colorItems.every(item => colorPattern.test(item))

        // 檢查是否有重複
        const hasDuplicates = new Set(colorItems).size !== colorItems.length

        if (!allValid || hasDuplicates) {
            alert('顏色格式錯誤：請輸入「#六位色碼」或「中文+#六位色碼」，並以逗號分隔，且不可重複')
            event.target.value = ''
        }
    }

    //提交驗證並將欄位資料轉乘JSON傳回API
    async function handleSubmit(event) {
        event.preventDefault() // 阻止原始表單送出

        const form = event.target
        const imageInput = form.querySelector('#product-image')
        const requiredFields = [
            'product-name',
            'product-description',
            'product-color',
            'product-size',
            'product-price',
            'product-stock'
        ]

        const hasEmpty = requiredFields.some(id => {
            const el = form.querySelector(`#${id}`)
            return !el || !el.value.trim()
        })

        if (!imageInput || imageInput.files.length === 0 || hasEmpty) {
            alert('請完整填寫所有欄位，包含圖片')
            return
        }

        //組成 JSON 資料物件
        const payload = {
            productName: form.querySelector('#product-name').value.trim(),
            productDescription: form.querySelector('#product-description').value.trim(),
            productColor: form.querySelector('#product-color').value.trim(),
            productSize: form.querySelector('#product-size').value.trim(),
            productPrice: Number(form.querySelector('#product-price').value),
            productStock: Number(form.querySelector('#product-stock').value),
            // 圖片處理方式見下方
        }

        //圖片轉 base64（可選，視後端 API 要求）
        const file = imageInput.files[0]
        const reader = new FileReader()
        reader.onload = async () => {
            payload.productImage = reader.result // base64 字串

            //傳送 JSON 給後端 API
            try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error('送出失敗')
            alert('新增成功')
            form.reset()
            clearPreview()
            } catch (err) {
            alert('送出失敗：' + err.message)
            }
        }

        reader.readAsDataURL(file)
    }

</script>