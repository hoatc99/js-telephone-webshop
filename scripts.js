//Toast Message
toast = ( { title, message, type, duration = 3000 } ) => {
    if (!document.querySelector('#toastsContainer')) {
        document.body.insertAdjacentHTML('afterbegin', '<div id="toastsContainer"></div>');
    }
    let toastContainer = document.querySelector('#toastsContainer');
    let icons = {
        success: 'fas fa-check-circle',
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-circle',
        error: 'fas fa-times-circle',
    }
    let delay = (duration / 1000).toFixed(2);
    let icon = icons[type];
    let toast = document.createElement('div');
    toast.classList.add('toast-item', `toast-${type}`);
    toast.style.animation = `slideIn .3s ease, fadeOut linear 1s ${delay}s forwards`;
    toast.innerHTML = `
        <div class="toast-icon"><i class="${icon}"></i></div>
        <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
        </div>
        <div class="toast-close"><i class="fas fa-times"></i></div>
        `;
    toastContainer.appendChild(toast);
    const autoRemoveChild = setTimeout(() => {
        toastContainer.removeChild(toast);
    }, duration + 1000);
    toast.onclick = (e) => {
        if (e.target.closest('.toast-close')) {
            toastContainer.removeChild(toast);
            clearTimeout(autoRemoveChild);
        }
    }
}

showSuccessToast = (message) => {
    toast({
        title: 'Thành công',
        message: message,
        type: 'success',
        duration: 3000
    });
}
showErrorToast = (message) => {
    toast({
        title: 'Lỗi',
        message: message,
        type: 'error',
        duration: 3000
    });
}

//loadCartInLocalStorage
let cartKeyLocalStorage = 'cartItemList';

loadCart = () => {
    let cart = new Array();
    let jsonItemList = localStorage.getItem(cartKeyLocalStorage);
    if (jsonItemList != null)
    cart = JSON.parse(jsonItemList);
    return cart;
};

writeCart = (cart) => {
    let jsonCart = JSON.stringify(cart);
    localStorage.setItem(cartKeyLocalStorage, jsonCart);
};

addProductToCart = (id) => {
    let isExist = false;
    for (let item in cart) {
        if (cart[item].id == id) {
            if (cart[item].quantity < 10) {
                cart[item].quantity++;
            }
            else {
                showErrorToast('Số lượng sản phẩm này trong giỏ đã đạt giới hạn');
            }
            isExist = true;
        }
    }
    if (!isExist) {
        cart.push(createItemInCart(id, 1));
    }
    writeCart(cart);
    loadNavBar();
    showProduct(filter);
};

createItemInCart = (id, quantity) => {
    let item = new Object();
    item.id = id;
    item.quantity = quantity;
    return item;
};

findProductById = (id) => {
    for (let item in products) {
        if (products[item].id == id) {
            return products[item];
        }
    }
}

updateProductInCart = (id) => {
    for (let item = 0; item < cart.length; item++) {
        let inputQuantity = Number(document.getElementsByClassName('item-quantity')[item+1].value);
        let cartQuantity = cart[item].quantity;
        if (cart[item].id == id && inputQuantity != cartQuantity && inputQuantity >= 1 && inputQuantity <= 10) {
            cart[item].quantity = inputQuantity;
            writeCart(cart);
            showCart();
            loadNavBar();
        }
    }
}

removeProductFromCart = (id) => {
    for (let item in cart) {
        if (cart[item].id == id) {
            cart.splice(item, 1);
        }
    }
    writeCart(cart);
    showCart();
    loadNavBar();
};

showCart = () => {
    if (cart.length == 0) {
        document.querySelector('#cart').innerHTML = `<h1 class="cart-title">Danh sách sản phẩm</h1>
                                                        <i class="fal fa-shopping-cart cart-null-icon"></i>
                                                        <p class='cart-null'>Giỏ hàng hiện tại chưa có sản phẩm nào</p>`;
        document.querySelector('#customerInfo').remove();
        return;
    }
    let sumTotalQuantity = 0;
    let sumTotalPrice = 0;
    html = `<h1 class="cart-title">Danh sách sản phẩm</h1>
            <div class="cart-item-title cart-item">
                <div class="item-img"></div>
                <p class="item-name">Tên sản phẩm</p>
                <div class='item-price'>Đơn giá</div>
                <p class="item-quantity">Số lượng</p>
                <p class="item-total">Tổng tiền</p>
                <div class="item-actions">Xóa</div>
            </div>`;
    for (let item in cart) {
        let product = findProductById(cart[item].id);
        let discount_check = product.discount == 0 ? true : false;
        let salePrice = !discount_check ? product.price * (100 - product.discount) / 100 : product.price;
        let totalPrice = !discount_check ? salePrice * cart[item].quantity : product.price * cart[item].quantity;
        sumTotalPrice += totalPrice;
        sumTotalQuantity += cart[item].quantity;
        html += `<div class="cart-item">
                    <div class="item-img">
                        <img src="${product.img}">
                    </div>
                    <p class="item-name">${product.name}</p>
                    <div class='item-price'>`;
                    if (!discount_check) { 
                        html += `<span class='item-price-origin'>${product.price}</span>
                        <p class='item-discount'>-${product.discount}%</p>`;
                    }
                        html += `<span class='item-price-sale'>${convertMoney(salePrice)}</span>
                    </div>
                    <input type="number" class="item-quantity" min="1" max="10" onchange="updateCart(\'${cart[item].id}\')" value="${cart[item].quantity}">
                    <p class="item-total">${convertMoney(totalPrice)}</p>
                    <div class="item-actions">
                        <button class='btn btn-primary' onclick="removeFromCart(\'${cart[item].id}\')"><i class="fal fa-trash"></i></button>
                    </div>
                </div>`;
    }
    html += `<hr><div class="cart-item cart-item-total">
                <div class="item-img"></div>
                <p class="item-name">Tổng số lượng & Tổng thành tiền</p>
                <div class='item-price'></div>
                <p class="item-quantity">${sumTotalQuantity}</p>
                <p class="item-total">${convertMoney(sumTotalPrice)}</p>
                <div class="item-actions"></div>
            </div>`;
    document.querySelector('#cart').innerHTML = html;
}

submitOrder = () => {
    let customerConfirm = confirm("Bạn vui lòng xác nhận đặt hàng");
    if (customerConfirm) {
        alert("Cảm ơn bạn đã đặt hàng và dành thời gian ghé shop của chúng tôi.");
        writeCart([]);
        showCart();
        loadNavBar();
    }
}

convertMoney = (num) => num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

createID = (id) => id.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replaceAll(' ', '-').replaceAll('+', '-plus').replaceAll('(', '').replaceAll(')', '').replaceAll('/', '-').toLowerCase();

loadProducts = () => {
    let array = new Array();
    for (let productType in productsList) {
        for (let productBrand in productsList[productType]) {
            for (let item in productsList[productType][productBrand]) {
                let product = productsList[productType][productBrand][item];
                array.push({
                    'productType': productType,
                    'productBrand': productBrand,
                    'id': createID(product.name),
                    'name': product.name,
                    'price': product.price,
                    'img': product.img,
                    'discount': product.discount,
                    'screen': product.screen,
                    'os': product.os,
                    'rearcam': product.rearcam,
                    'frontcam': product.frontcam,
                    'cpu': product.cpu,
                    'storage': product.storage,
                    'battery': product.battery
                });
            }
        }
    }
    return array;
};

showProduct = (products) => {
    document.getElementById('items').innerHTML = '';
    for (let item in products) {
        item = products[item];
        let discount_check = item.discount == 0 ? true : false;
        let salePrice = !discount_check ? item.price * (100 - item.discount) / 100 : item.price;
        let html = 
        `<a class='item'>
            <div href='javascript:void(0)' onclick="openProductSpecification(\'${item.id}\')">
                <div class='item-img'>
                    <img src='${item.img}'>
                </div>
                <h2 class='item-name'>${item.name}</h2>
                <div class='item-price'>`;
                if (!discount_check) { 
                    html += `<span class='item-price-origin'>${convertMoney(item.price)}</span>
                    <p class='item-discount'>-${item.discount}%</p>`
                }
                html += `<span class='item-price-sale'>${convertMoney(salePrice)}</span>
                </div>
            </div>
            <button class='btn btn-primary' onclick="addToCart(\'${item.id}\')">Đưa vào giỏ hàng`
            if (itemCountInCartById(item.id) > 0)
                html += `<p class='item-in-cart-count'>${itemCountInCartById(item.id)}</p>
            </button>
        </a>`;
        document.getElementById('items').innerHTML += html;
    };
};

productSpecification = (id) => {
    let product = findProductById(id);
    let html = `<div id="specificationModal">
        <div class="modal-wrapper">
            <table>
                <thead>
                    <tr><td colspan="2" class="modal-header">Thông số kỹ thuật</td></tr>
                    <tr><td colspan="2" class="modal-productname">${product.name}</td></tr>
                </thead>
                <tbody class="modal-main">
                    <tr>
                        <td>Màn hình</td>
                        <td>${product.screen}</td>
                    </tr>
                    <tr>
                        <td>Hệ điều hành</td>
                        <td>${product.os}</td>
                    </tr>
                    <tr>
                        <td>Camera sau</td>
                        <td>${product.rearcam}</td>
                    </tr>
                    <tr>
                        <td>Camera trước</td>
                        <td>${product.frontcam}</td>
                    </tr>
                    <tr>
                        <td>Chip</td>
                        <td>${product.cpu}</td>
                    </tr>
                    <tr>
                        <td>Bộ nhớ trong</td>
                        <td>${product.storage}</td>
                    </tr>
                    <tr>
                        <td>Pin, sạc</td>
                        <td>${product.battery}</td>
                    </tr>
                </tbody>
            </table>
            <a href="javascript:void(0)" class="modal-close" onclick="closeModal()">Đóng</div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('afterbegin', html);
}
productSpecification2 = (id) => {
    let product = findProductById(id);
    let html = `<div id="specificationModal">
        <div class="modal-wrapper">
            <h2 class="modal-header">Thông số kỹ thuật</h2>
            <div class="modal-productname">${product.name}</div>
            <div class="modal-main">
                <div class="modal-item odd">
                    <div class="item-left">Màn hình</div>
                    <div class="item-right">${product.screen}</div>
                </div>
                <div class="modal-item even">
                    <div class="item-left">Hệ điều hành</div>
                    <div class="item-right">${product.os}</div>
                </div>
                <div class="modal-item odd">
                    <div class="item-left">Camera sau</div>
                    <div class="item-right">${product.rearcam}</div>
                </div>
                <div class="modal-item even">
                    <div class="item-left">Camera trước</div>
                    <div class="item-right">${product.frontcam}</div>
                </div>
                <div class="modal-item odd">
                    <div class="item-left">Chip</div>
                    <div class="item-right">${product.cpu}</div>
                </div>
                <div class="modal-item even">
                    <div class="item-left">Bộ nhớ trong</div>
                    <div class="item-right">${product.storage}</div>
                </div>
                <div class="modal-item odd">
                    <div class="item-left">Pin, Sạc</div>
                    <div class="item-right">${product.battery}</div>
                </div>
            </div>
            <a href="javascript:void(0)" class="modal-close" onclick="closeModal()">Đóng</div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('afterbegin', html);
}

closeModal = () => {
    document.getElementById('specificationModal').remove();
}

loadProductByPriceAsc = () => {
    filter = products.sort((a, b) => a.price - b.price);
    showProduct(filter);
};

loadProductByPriceDesc = () => {
    filter = products.sort((a, b) => b.price - a.price);
    showProduct(filter);
};

loadProductFilterByPrice = (lowPrice, highPrice) => {
    filter = products.filter(a => a.price >= Number(lowPrice.value) && a.price <= Number(highPrice.value)).sort((a, b) => a.price - b.price);
    showProduct(filter);
};

loadProductByType = (productType) => {
    filter = products.filter(a => a.productType.toLowerCase() == productType.toLowerCase());
    showProduct(filter);
};

loadProductByBrand = (productType, productBrand) => {
    filter = products.filter(a => a.productBrand.toLowerCase() == productBrand.toLowerCase() && a.productType.toLowerCase() == productType.toLowerCase());
    showProduct(filter);
};

itemCountInCart = () => {
    let count = 0;
    for (let item in cart) {
        count += cart[item].quantity;
    }
    return count;
}

itemCountInCartById = (id) => {
    let count = 0;
    for (let item in cart) {
        if (cart[item].id == id) {
            count += cart[item].quantity;
        }
    }
    return count;
}

itemCountInProductType = (productType) => {
    let count = 0;
    for (let product in products) {
        if (products[product].productType.toLowerCase() == productType.toLowerCase()) {
            count++;
        }
    }
    return count;
}

loadNavBar = () => {
    document.getElementById('nav-bar').innerHTML = `<ul id="menu-level-1">
                                                        <li class="item-level-1">
                                                            <a href="index.html" class="item-level-1-title">
                                                                <i class="fas fa-fingerprint"></i>
                                                                <p>Trang chủ</p>
                                                            </a>
                                                        </li>
                                                        <li class="item-level-1">
                                                            <a href="introduce.html" class="item-level-1-title">
                                                                <i class="fas fa-info"></i>
                                                                <p>Giới thiệu</p>
                                                            </a>
                                                        </li>
                                                        <li class="item-level-1">
                                                            <a href="phone.html" class="item-level-1-title">
                                                                <p class="item-count">${itemCountInProductType('phone')}</p>
                                                                <i class="fal fa-mobile"></i>
                                                                <p>Điện thoại</p>
                                                            </a>
                                                        </li>
                                                        <li class="item-level-1">
                                                            <a href="tablet.html" class="item-level-1-title">
                                                            <p class="item-count">${itemCountInProductType('tablet')}</p>
                                                                <i class="fal fa-tablet"></i>
                                                                <p>Máy tính bảng</p>
                                                            </a>
                                                        </li>
                                                        <li class="item-level-1">
                                                            <a href="laptop.html" class="item-level-1-title">
                                                            <p class="item-count">${itemCountInProductType('laptop')}</p>
                                                                <i class="fal fa-laptop"></i>
                                                                <p>Laptop</p>
                                                            </a>
                                                        </li>
                                                        <li class="item-level-1">
                                                            <a href="watch.html" class="item-level-1-title">
                                                            <p class="item-count">${itemCountInProductType('watch')}</p>
                                                                <i class="fal fa-watch"></i>
                                                                <p>Đồng hồ</p>
                                                            </a>
                                                        </li>
                                                        <li class="item-level-1">
                                                            <a href="login.html" class="item-level-1-title">
                                                                <i class="fas fa-user"></i>
                                                                <p>Đăng nhập</p>
                                                            </a>
                                                        </li>
                                                        <li class="item-level-1">
                                                            <a href="cart.html" class="item-level-1-title">
                                                                <p class="item-cart-count">${itemCountInCart()}</p>
                                                                <i class="fal fa-cart-arrow-down"></i>
                                                                <p>Giỏ hàng</p>
                                                            </a>
                                                        </li>
                                                    </ul>`
}

loadFooter = () => {
    document.getElementById('footer').innerHTML = `<p>Copyright by @TCH</p>`;
}

checkLogin = (customerID, customerPassword) => {
    if (customerID == 'admin' && customerPassword == '123')
        showSuccessToast('Đăng nhập thành công');
    else 
        showErrorToast('Đăng nhập thất bại. Sai tài khoản hoặc mật khẩu');
}

loginFormSwitchLogin = () => {
    document.getElementById('login').hidden = false;
    document.getElementById('register').hidden = true;
    document.getElementById('passwordRetrieval').hidden = true;
}

loginFormSwitchRegister = () => {
    document.getElementById('login').hidden = true;
    document.getElementById('register').hidden = false;
    document.getElementById('passwordRetrieval').hidden = true;
}

loginFormSwitchPasswordRetrieval = () => {
    document.getElementById('login').hidden = true;
    document.getElementById('register').hidden = true;
    document.getElementById('passwordRetrieval').hidden = false;
}

//JSON data
const productsList = {
    'Phone': {
        'Iphone': [
            {
                'name': 'iPhone 12',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/213031/iphone-12-do-new-2-600x600.jpg',
                'price': 20990000,
                'discount': 20,
                'screen': 'OLED, 6.1", Super Retina XDR',
                'os': 'iOS 15',
                'rearcam': '2 camera 12 MP',
                'frontcam': '12 MP',
                'cpu': 'Apple A14 Bionic',
                'ram': '4 GB',
                'storage': '64 GB',
                'battery': '2815 mAh, 20 W'
            },
            {
                'name': 'iPhone 13 Pro Max',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-graphite-600x600.jpg',
                'price': 33990000,
                'discount': 70,
                'screen': 'OLED, 6.7", Super Retina XDR',
                'os': 'iOS 15',
                'rearcam': '3 camera 12 MP',
                'frontcam': '12 MP',
                'cpu': 'Apple A15 Bionic',
                'ram': '6 GB',
                'storage': '128 GB',
                'battery': '4352 mAh, 20 W'
            },
            {
                'name': 'iPhone 13 Pro',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/230521/iphone-13-pro-silver-600x600.jpg',
                'price': 30990000,
                'discount': 10,
                'screen': 'OLED, 6.1", Super Retina XDR',
                'os': 'iOS 15',
                'rearcam': '3 camera 12 MP',
                'frontcam': '12 MP',
                'cpu': 'Apple A15 Bionic',
                'ram': '6 GB',
                'storage': '128 GB',
                'battery': '3095 mAh, 20 W'
            },
            {
                'name': 'iPhone 12 Pro Max',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/213033/iphone-12-pro-max-xanh-duong-new-600x600-600x600.jpg',
                'price': 31990000,
                'discount': 30,
                'screen': 'OLED, 6.7", Super Retina XDR',
                'os': 'iOS 15',
                'rearcam': '3 camera 12 MP',
                'frontcam': '12 MP',
                'cpu': 'Apple A14 Bionic',
                'ram': '6 GB',
                'storage': '128 GB',
                'battery': '3687 mAh, 20 W'
            },
            {
                'name': 'iPhone 12 Pro',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/213032/iphone-12-pro-gold-600x600.jpg',
                'price': 28990000,
                'discount': 35,
                'screen': 'OLED, 6.1", Super Retina XDR',
                'os': 'iOS 15',
                'rearcam': '3 camera 12 MP',
                'frontcam': '12 MP',
                'cpu': 'Apple A14 Bionic',
                'ram': '6 GB',
                'storage': '128 GB',
                'battery': '2815 mAh, 20 W'
            },
            {
                'name': 'iPhone 13',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/223602/iphone-13-midnight-2-600x600.jpg',
                'price': 24990000,
                'discount': 17,
                'screen': 'OLED, 6.1", Super Retina XDR',
                'os': 'iOS 15',
                'rearcam': '2 camera 12 MP',
                'frontcam': '12 MP',
                'cpu': 'Apple A15 Bionic',
                'ram': '4 GB',  
                'storage': '128 GB',
                'battery': '3240 mAh, 20 W'
            },
            {
                'name': 'iPhone 13 mini',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/236780/iphone-13-mini-midnight-1-600x600.jpg',
                'price': 20990000,
                'discount': 1,
                'screen': 'OLED, 5.4", Super Retina XDR',
                'os': 'iOS 15',
                'rearcam': '2 camera 12 MP',
                'frontcam': '12 MP',
                'cpu': 'Apple A15 Bionic',
                'ram': '4 GB',  
                'storage': '128 GB',
                'battery': '2438 mAh, 20 W'
            },
            {
                'name': 'iPhone 12 mini',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/225380/iphone-12-mini-den-15-600x600.jpg',
                'price': 16990000,
                'discount': 4,
                'screen': 'OLED, 5.4", Super Retina XDR',
                'os': 'iOS 15',
                'rearcam': '2 camera 12 MP',
                'frontcam': '12 MP',
                'cpu': 'Apple A14 Bionic',
                'ram': '4 GB',  
                'storage': '64 GB',
                'battery': '2227 mAh, 20 W'
            },
            {
                'name': 'iPhone 11',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/153856/iphone-xi-do-600x600.jpg',
                'price': 17990000,
                'discount': 0,
                'screen': 'IPS LCD, 6.1", Liquid Retina',
                'os': 'iOS 15',
                'rearcam': '2 camera 12 MP',
                'frontcam': '12 MP',
                'cpu': 'Apple A13 Bionic',
                'ram': '4 GB',  
                'storage': '64 GB',
                'battery': '3110 mAh, 18 W'
            },
            {
                'name': 'iPhone XR',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/190325/iphone-xr-hopmoi-den-600x600-2-600x600.jpg',
                'price': 13490000,
                'discount': 0,
                'screen': 'IPS LCD, 6.1", Liquid Retina',
                'os': 'iOS 15',
                'rearcam': '12 MP',
                'frontcam': '7 MP',
                'cpu': 'Apple A12 Bionic',
                'ram': '3 GB',  
                'storage': '64 GB',
                'battery': '2942 mAh, 15 W'
            },
            {
                'name': 'iPhone SE (2020)',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/222629/iphone-se-128gb-2020-do-600x600.jpg',
                'price': 12490000,
                'discount': 0,
                'screen': 'IPS LCD, 4.7"',
                'os': 'iOS 14',
                'rearcam': '12 MP',
                'frontcam': '7 MP',
                'cpu': 'Apple A13 Bionic',
                'ram': '3 GB',  
                'storage': '64 GB',
                'battery': '1821 mAh, 18 W'
            },
            {
                'name': 'iPhone SE (2020) (Hộp mới)',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/230410/iphone-se-2020-trang-600x600-600x600.jpg',
                'price': 11990000,
                'discount': 0,
                'screen': 'IPS LCD, 4.7", Retina HD',
                'os': 'iOS 15',
                'rearcam': '12 MP',
                'frontcam': '7 MP',
                'cpu': 'Apple A13 Bionic',
                'ram': '3 GB',  
                'storage': '64 GB',
                'battery': '1821 mAh, 18 W'
            }
        ],
        'Samsung': [
            {
                'name': 'Samsung Galaxy Z Fold3 5G 512GB',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/248284/samsung-galaxy-z-fold-3-green-1-600x600.jpg',
                'price': 44990000,
                'discount': 0,
                'screen': 'Dynamic AMOLED 2X, Chính 7.6" & Phụ 6.2", Full HD+',
                'os': 'Android 11',
                'rearcam': '3 camera 12 MP',
                'frontcam': '10 MP & 4 MP',
                'cpu': 'Snapdragon 888',
                'ram': '12 GB',  
                'storage': '512 GB',
                'battery': '4400 mAh, 25 W'
            },
            {
                'name': 'Samsung Galaxy A03s',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/241049/samsung-galaxy-a03s-blue-600x600.jpg',
                'price': 3690000,
                'discount': 0,
                'screen': 'PLS LCD, 6.5", HD+',
                'os': 'Android 11',
                'rearcam': 'Chính 13 MP & Phụ 2 MP, 2 MP',
                'frontcam': '5 MP',
                'cpu': 'MediaTek MT6765',
                'ram': '4 GB',  
                'storage': '64 GB',
                'battery': '5000 mAh, 7.75 W'
            },
            {
                'name': 'Samsung Galaxy A52s 5G',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/247507/samsung-galaxy-a52s-5g-mint-600x600.jpg',
                'price': 10990000,
                'discount': 0,
                'screen': 'Super AMOLED, 6.5", Full HD+',
                'os': 'Android 11',
                'rearcam': 'Chính 64 MP & Phụ 12 MP, 5 MP, 5 MP',
                'frontcam': '32 MP',
                'cpu': 'Snapdragon 778G 5G 8 nhân',
                'ram': '8 GB',  
                'storage': '128 GB',
                'battery': '4500 mAh, 25 W'
            },
            {
                'name': 'Samsung Galaxy Z Fold2 5G',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/226099/samsung-galaxy-z-fold-2-den-600x600.jpg',
                'price': 50000000,
                'discount': 0,
                'screen': 'Chính: Dynamic AMOLED 2X, Phụ: Super AMOLED, Chính 7.59" & Phụ 6.23", Full HD+',
                'os': 'Android 10',
                'rearcam': '3 camera 12 MP',
                'frontcam': 'Trong 10 MP & Ngoài 10 MP',
                'cpu': 'Snapdragon 865+',
                'ram': '12 GB',  
                'storage': '256 GB',
                'battery': '4500 mAh, 25 W'
            },
            {
                'name': 'Samsung Galaxy Z Fold3 5G 256GB',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/226935/samsung-galaxy-z-fold-3-silver-1-600x600.jpg',
                'price': 41990000,
                'discount': 0,
                'screen': 'Dynamic AMOLED 2X, Chính 7.6" & Phụ 6.2", Full HD+',
                'os': 'Android 11',
                'rearcam': '3 camera 12 MP',
                'frontcam': '10 MP & 4 MP',
                'cpu': 'Snapdragon 888',
                'ram': '12 GB',  
                'storage': '256 GB',
                'battery': '4400 mAh, 25 W'
            },
            {
                'name': 'Samsung Galaxy Z Flip3 5G 256GB',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/248283/samsung-galaxy-z-flip-3-violet-1-600x600.jpg',
                'price': 26990000,
                'discount': 0,
                'screen': 'Dynamic AMOLED 2X, Chính 6.7" & Phụ 1.9", Full HD+',
                'os': 'Android 11',
                'rearcam': '2 camera 12 MP',
                'frontcam': '10 MP',
                'cpu': 'Snapdragon 888',
                'ram': '8 GB',  
                'storage': '256 GB',
                'battery': '3300 mAh, 15 W'
            },
            {
                'name': 'Samsung Galaxy Z Flip3 5G 128GB',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/229949/samsung-galaxy-z-flip-3-black-1-600x600.jpg',
                'price': 24990000,
                'discount': 0
            },
            {
                'name': 'Samsung Galaxy S21 Ultra 5G 128GB',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/226316/samsung-galaxy-s21-ultra-bac-600x600-1-600x600.jpg',
                'price': 30990000,
                'discount': 0
            },
            {
                'name': 'Samsung Galaxy S21+ 5G 256GB',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/226385/samsung-galaxy-s21-plus-den-600x600-600x600.jpg',
                'price': 28990000,
                'discount': 0
            },
            {
                'name': 'Samsung Galaxy S21+ 5G 128GB',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/226385/samsung-galaxy-s21-plus-den-600x600-600x600.jpg',
                'price': 25990000,
                'discount': 0
            },
            {
                'name': 'Samsung Galaxy Note 20',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/218355/samsung-galaxy-note-20-062220-122200-fix-600x600.jpg',
                'price': 23990000,
                'discount': 0
            },
            {
                'name': 'Samsung Galaxy S21 5G',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/220833/samsung-galaxy-s21-tim-600x600.jpg',
                'price': 20990000,
                'discount': 0
            },
            {
                'name': 'Samsung Galaxy S20 FE (8GB/256GB)',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/224859/samsung-galaxy-s20-fan-edition-090320-040338-600x600.jpg',
                'price': 15490000,
                'discount': 0
            },
            {
                'name': 'Samsung Galaxy A52s 5G 256GB',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/251879/samsung-galaxy-a52s-5g-black-600x600.jpg',
                'price': 11790000,
                'discount': 0
            },
            {
                'name': 'Samsung Galaxy A72',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/226101/samsung-galaxy-a72-thumb-balck-600x600-600x600.jpg',
                'price': 11490000,
                'discount': 0
            },
            {
                'name': 'Samsung Galaxy A52 5G',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/236085/samsung-galaxy-a52-8gb-256gb-thumb-white-600x600-600x600.jpg',
                'price': 10990000,
                'discount': 0
            },
            {
                'name': 'Samsung Galaxy M51',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/217536/samsung-galaxy-m51-den-new-600x600-600x600.jpg',
                'price': 9490000,
                'discount': 0
            },
            {
                'name': 'Samsung Galaxy A51 (6GB/128GB)',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/211570/samsung-galaxy-a51-silver-600x600.jpg',
                'price': 7990000,
                'discount': 0
            },
            {
                'name': 'Samsung Galaxy A32',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/234315/samsung-galaxy-a32-4g-thumb-tim-600x600-600x600.jpg',
                'price': 6690000,
                'discount': 0
            },
            {
                'name': 'Samsung Galaxy A22',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/237603/samsung-galaxy-a22-4g-mint-1-600x600.jpg',
                'price': 5890000,
                'discount': 0
            },
            {
                'name': 'Samsung Galaxy A31',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/216174/samsung-galaxy-a31-trang-new-600x600-600x600.jpg',
                'price': 5790000,
                'discount': 0
            },
            {
                'name': 'Samsung Galaxy A12 6GB (2021)',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/251888/samsung-galaxy-a12-2021-black-600x600.jpg',
                'price': 4690000,
                'discount': 0
            },
            {
                'name': 'Samsung Galaxy A12 6GB',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/232364/samsung-galaxy-a12-trang-600x600.jpg',
                'price': 4690000,
                'discount': 0
            },
            {
                'name': 'Samsung Galaxy A12 4GB (2021)',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/251886/samsung-galaxy-a12-2021-blue-600x600.jpg',
                'price': 4290000,
                'discount': 0
            },
            {
                'name': 'Samsung Galaxy A12 4GB',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/251886/samsung-galaxy-a12-2021-blue-600x600.jpg',
                'price': 4290000,
                'discount': 0
            },
            {
                'name': 'Samsung Galaxy A02s (4GB/64GB)',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/232271/samsung-galaxy-a02s-trang-600x600-600x600.jpg',
                'price': 3590000,
                'discount': 0
            },
            {
                'name': 'Samsung Galaxy A02s (3GB/32GB)',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/230525/samsung-galaxy-a02s-den-600x600-600x600.jpg',
                'price': 3190000,
                'discount': 0
            },
            {
                'name': 'Samsung Galaxy A02',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/228999/samsung-galaxy-a02-den-600x600-600x600.jpg',
                'price': 2590000,
                'discount': 0
            }
        ],
        'Oppo': [
            {
                'name': 'OPPO Reno6 Z 5G',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/239747/oppo-reno6-z-5g-aurora-1-600x600.jpg',
                'price': 9490000,
                'discount': 0
            },
            {
                'name': 'OPPO A74',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/235653/oppo-a74-blue-9-600x600.jpg',
                'price': 6690000,
                'discount': 0
            },
            {
                'name': 'OPPO Reno6 Pro 5G',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/236187/oppo-reno6-pro-blue-1-600x600.jpg',
                'price': 18990000,
                'discount': 0
            },
            {
                'name': 'OPPO Find X3 Pro 5G',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/232190/oppo-find-x3-pro-black-001-1-600x600.jpg',
                'price': 26990000,
                'discount': 0
            },
            {
                'name': 'OPPO Reno6 5G',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/236186/oppo-reno6-5g-aurora-600x600.jpg',
                'price': 12990000,
                'discount': 0
            },
            {
                'name': 'OPPO Reno5 5G',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/233460/oppo-reno5-5g-thumb-600x600.jpg',
                'price': 11990000,
                'discount': 0
            },
            {
                'name': 'OPPO Reno4 Pro',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/223497/oppo-reno4-pro-trang-600x600.jpg',
                'price': 10490000,
                'discount': 0
            },
            {
                'name': 'OPPO Reno5 Marvel',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/223497/oppo-reno4-pro-trang-600x600.jpg',
                'price': 9690000,
                'discount': 0
            },
            {
                'name': 'OPPO Reno5',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/220438/oppo-reno5-trang-600x600-1-600x600.jpg',
                'price': 8690000,
                'discount': 0
            },
            {
                'name': 'OPPO A74 5G',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/236559/oppo-a74-5g-silver-01-600x600.jpg',
                'price': 7990000,
                'discount': 0
            },
            {
                'name': 'OPPO A94',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/234316/oppo-a94-black-thumb-purple-600x600-600x600.jpg',
                'price': 7690000,
                'discount': 0
            },
            {
                'name': 'OPPO A93',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/229056/oppo-a93-trang-14-600x600.jpg',
                'price': 6490000,
                'discount': 0
            },
            {
                'name': 'OPPO A55',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/249944/oppo-a55-4g-blue-600x600.jpg',
                'price': 4990000,
                'discount': 0
            },
            {
                'name': 'OPPO A54',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/236768/oppo-a54-4g-blue-600x600.jpg',
                'price': 4690000,
                'discount': 0
            },
            {
                'name': 'OPPO A15s',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/229948/oppo-a15s-xanh-600x600-3-600x600.jpg',
                'price': 4290000,
                'discount': 0
            },
            {
                'name': 'OPPO A16',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/240631/oppo-a16-silver-8-600x600.jpg',
                'price': 3990000,
                'discount': 0
            },
            {
                'name': 'OPPO A15',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/229885/oppo-a15-black-fix-600x600.jpg',
                'price': 3690000,
                'discount': 0
            }
        ],
        'Vivo': [
            {
                'name': 'Vivo Y21',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/115343/vivo-y21-white-01-1-600x600.jpg',
                'price': 4290000,
                'discount': 0
            },
            {
                'name': 'Vivo X70 Pro 5G',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/248099/vivo-x70-pro-xanh-hong-1-600x600.jpg',
                'price': 19990000,
                'discount': 0
            },
            {
                'name': 'Vivo V21 5G',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/238047/vivo-v21-5g-xanh-den-600x600.jpg',
                'price': 9990000,
                'discount': 0
            },
            {
                'name': 'Vivo V20 (2021)',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/232614/vivov202021den-600x600.jpg',
                'price': 8490000,
                'discount': 0
            },
            {
                'name': 'Vivo V20',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/228453/vivo-v20-600-xanh-hong-2-600x600.jpg',
                'price': 8490000,
                'discount': 0
            },
            {
                'name': 'Vivo Y72 5G',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/236431/vivo-y72-5g-blue-600x600.jpg',
                'price': 7990000,
                'discount': 0
            },
            {
                'name': 'Vivo Y53s',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/240286/vivo-y53s-xanh-600x600.jpg',
                'price': 6990000,
                'discount': 0
            },
            {
                'name': 'Vivo V20 SE',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/228141/vivo-v20-se-600x600-600x600.jpg',
                'price': 7190000,
                'discount': 0
            },
            {
                'name': 'Vivo Y51 (2020)',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/228950/vivo-y51-bac-600x600-600x600.jpg',
                'price': 6290000,
                'discount': 0
            },
            {
                'name': 'Vivo Y21s 6GB',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/250755/vivo-y21s-white-600x600.jpg',
                'price': 5990000,
                'discount': 0
            },
            {
                'name': 'Vivo Y21s 4GB',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/249429/vivo-y21s-blue-600x600.jpg',
                'price': 5290000,
                'discount': 0
            },
            {
                'name': 'Vivo Y20s',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/228376/vivo-y20s-xanh-1-600x600.jpg',
                'price': 4990000,
                'discount': 0
            },
            {
                'name': 'Vivo Y20 (2021)',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/231984/vivo-y20-2021-blue-600x600.jpg',
                'price': 3990000,
                'discount': 0
            },
            {
                'name': 'Vivo Y12s (4GB/128GB)',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/230630/vivo-y12s-den-new-600x600-600x600.jpg',
                'price': 4290000,
                'discount': 0
            },
            {
                'name': 'Vivo Y15s',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/249720/Vivo-y15s-2021-xanh-den-660x600.jpg',
                'price': 3690000,
                'discount': 0
            },
            {
                'name': 'Vivo Y12s (2021) (3GB/32GB)',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/237935/vivo-y12s-2021-black-600x600.jpg',
                'price': 3290000,
                'discount': 0
            }
        ],
        'Xiaomi': [
            {
                'name': 'Xiaomi 11T 5G 128GB',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/248293/xiaomi-11t-white-1-2-600x600.jpg',
                'price': 10990000,
                'discount': 0
            },
            {
                'name': 'Xiaomi Redmi Note 10S',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/235969/xiaomi-redmi-note-10s-xam-1-600x600.jpg',
                'price': 6490000,
                'discount': 0
            },
            {
                'name': 'Xiaomi Mi 11 5G',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/226264/xiaomi-mi-11-xanhduong-600x600-600x600.jpg',
                'price': 19990000,
                'discount': 0
            },
            {
                'name': 'Xiaomi 11T Pro 5G',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/248218/xiaomi-11t-pro-blue-1-600x600.jpg',
                'price': 14990000,
                'discount': 0
            },
            {
                'name': 'Xiaomi Mi 10T Pro 5G',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/228136/xiaomi-mi-10t-pro-bac-600x600.jpg',
                'price': 12990000,
                'discount': 0
            },
            {
                'name': 'Xiaomi 11T 5G 256GB',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/251216/xiaomi-11t-grey-1-600x600.jpg',
                'price': 11490000,
                'discount': 0
            },
            {
                'name': 'Xiaomi 11 Lite 5G NE',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/249427/xiaomi-11-lite-5g-ne-pink-600x600.jpg',
                'price': 9490000,
                'discount': 0
            },
            {
                'name': 'Xiaomi Mi 11 Lite',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/233241/xiaomi-mi-11-lite-4g-black-1-600x600.jpg',
                'price': 7990000,
                'discount': 0
            },
            {
                'name': 'Xiaomi Redmi Note 10 Pro (8GB/128GB)',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/229228/xiaomi-redmi-note-10-pro-thumb-xam-600x600-600x600.jpg',
                'price': 7490000,
                'discount': 0
            },
            {
                'name': 'Xiaomi Redmi Note 10 5G 8GB',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/235971/xiaomi-redmi-note-10-5g-xanh-bong-dem-1-600x600.jpg',
                'price': 5990000,
                'discount': 0
            },
            {
                'name': 'Xiaomi Redmi Note 10 5G 4GB',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/238306/xiaomi-redmi-note-10-5g-bac-600x600.jpg',
                'price': 5290000,
                'discount': 0
            },
            {
                'name': 'Xiaomi Redmi 9T (6GB/128GB)',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/233130/xiaomi-redmi-9t-6gb-110621-080650-600x600.jpg',
                'price': 4990000,
                'discount': 0
            },
            {
                'name': 'Xiaomi Redmi 10 (6GB/128GB)',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/246200/redmi-10-gray-600x600.jpg',
                'price': 4690000,
                'discount': 0
            },
            {
                'name': 'Xiaomi Redmi Note 9',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/214925/xiaomi-redmi-note-9-den-600x600-600x600.jpg',
                'price': 4990000,
                'discount': 0
            },
            {
                'name': 'Xiaomi Redmi 10 (4GB/128GB)',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/249081/redmi-10-white-600x600.jpg',
                'price': 4290000,
                'discount': 0
            },
            {
                'name': 'Xiaomi Redmi 9T (4GB/64GB)',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/231667/redmi-9t-cam-600x600-600x600.jpg',
                'price': 3990000,
                'discount': 0
            },
            {
                'name': 'Xiaomi Redmi 10 (4GB/64GB)',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/249080/redmi-10-gray-600x600.jpg',
                'price': 3990000,
                'discount': 0
            },
            {
                'name': 'Xiaomi Redmi 9C (4GB/128GB)',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/226321/xiaomi-redmi-9c-3gb-xam-600x600.jpg',
                'price': 3490000,
                'discount': 0
            },
            {
                'name': 'Xiaomi Redmi 9C (3GB/64GB)',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/226321/xiaomi-redmi-9c-3gb-xam-600x600.jpg',
                'price': 2990000,
                'discount': 0
            },
            {
                'name': 'Xiaomi Redmi 9A',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/218734/xiaomi-redmi-9a-grey-600x600-1-600x600.jpg',
                'price': 2290000,
                'discount': 0
            },
            {
                'name': 'Xiaomi 11 Lite 5G NE Trắng Swarovski',
                'img': 'https://cdn.tgdd.vn/Products/Images/42/256053/xiaomi-11-lite-5g-ne-trang-swarovski-1-660x600.jpg',
                'price': 9490000,
                'discount': 0
            }
        ]
    },
    'Tablet': {
        'iPad': [
            {
                'name': 'iPad Pro M1 12.9 inch WiFi Cellular 512GB (2021)',
                'img': 'https://cdn.tgdd.vn/Products/Images/522/259651/ipad-pro-2021-129-inch-gray-thumb-600x600.jpg',
                'price': 41990000,
                'discount': 0
            }
        ],
        'Samsung': [
            {
                'name': 'Samsung Galaxy Tab S7 FE 4G',
                'img': 'https://cdn.tgdd.vn/Products/Images/522/240254/samsung-galaxy-tab-s7-fe-green-600x600.jpg',
                'price': 13990000,
                'discount': 0
            }
        ]
    },
    'Laptop': {
        'Macbook': [
            {
                'name': 'MacBook Pro 16 M1 Max 2021/32 core-GPU',
                'img': 'https://cdn.tgdd.vn/Products/Images/44/253582/apple-macbook-pro-16-m1-max-2021-600x600.jpg',
                'price': 90990000,
                'discount': 0
            },
            {
                'name': 'MacBook Pro 14 M1 Max 2021/32-core GPU',
                'img': 'https://cdn.tgdd.vn/Products/Images/44/263915/macbook-pro-14-m1-max-2021-10-core-cpu-32gb-1tb-ssd-32-core-gpu-021221-040129-600x600.jpg',
                'price': 87900000,
                'discount': 0
            },
            {
                'name': 'MacBook Pro 14 inch M1 Max 2021/24-core GPU',
                'img': 'https://cdn.tgdd.vn/Products/Images/44/263914/macbook-pro-14-m1-max-2021-10-core-cpu-600x600.jpg',
                'price': 76900000,
                'discount': 0
            },
            {
                'name': 'MacBook Pro 16 inch M1 Pro 2021',
                'img': 'https://cdn.tgdd.vn/Products/Images/44/253706/apple-macbook-pro-16-m1-pro-2021-10-core-cpu-600x600.jpg',
                'price': 69990000,
                'discount': 0
            },
            {
                'name': 'MacBook Pro 16 M1 Pro 2021/16 core-GPU',
                'img': 'https://cdn.tgdd.vn/Products/Images/44/253636/apple-macbook-pro-16-m1-pro-2021-10-core-cpu-600x600.jpg',
                'price': 64990000,
                'discount': 0
            },
            {
                'name': 'MacBook Pro 14 M1 Pro 2021/16-core GPU',
                'img': 'https://cdn.tgdd.vn/Products/Images/44/253703/apple-macbook-pro-14-m1-pro-2021-10-core-cpu-1-1-600x600.jpg',
                'price': 64990000,
                'discount': 0
            },
            {
                'name': 'MacBook Pro 14 M1 Pro 2021/14 core-GPU',
                'img': 'https://cdn.tgdd.vn/Products/Images/44/253581/apple-macbook-pro-14-m1-pro-2021-600x600.jpg',
                'price': 52990000,
                'discount': 0
            },
            {
                'name': 'MacBook Pro M1 2020',
                'img': 'https://cdn.tgdd.vn/Products/Images/44/236131/apple-macbook-pro-m1-2020-z11c000cj-600x600.jpg',
                'price': 50990000,
                'discount': 20
            }
        ],
        'HP': [
            {
                'name': 'HP ZBook Firefly 14 G8 i7 1165G7 (275W0AV)',
                'img': 'https://cdn.tgdd.vn/Products/Images/44/259865/hp-zbook-firefly-14-g8-i7-275w0av-251121-045610-600x600.jpg',
                'price': 41890000,
                'discount': 0
            },
            {
                'name': 'HP Envy 13 ba1030TU i7 1165G7 (2K0B6PA)',
                'img': 'https://cdn.tgdd.vn/Products/Images/44/230240/hp-envy-13-ba1030tu-i7-2k0b6pa-101820-091857-600x600.jpg',
                'price': 30690000,
                'discount': 0
            },
            {
                'name': 'HP 340s G7 i5 1035G1 (36A35PA)',
                'img': 'https://cdn.tgdd.vn/Products/Images/44/238015/hp-340s-g7-i5-36a35pa-600x600.jpg',
                'price': 18290000,
                'discount': 0
            },
            {
                'name': 'HP 240 G8 i5 1135G7 (518V7PA)',
                'img': 'https://cdn.tgdd.vn/Products/Images/44/253155/hp-240-g8-i5-518v7pa-091221-015139-600x600.jpg',
                'price': 18290000,
                'discount': 20
            },
        ]
    },
    'Watch': {
        'Apple': [
            {
                'name': 'Apple Watch S6 LTE 40mm viền nhôm dây silicone',
                'img': 'https://cdn.tgdd.vn/Products/Images/7077/234910/s6-lte-40mm-vien-nhom-day-cao-su-hong-thumb-2-600x600.jpg',
                'price': 14990000,
                'discount': 20
            },
            {
                'name': 'Apple Watch S6 LTE 40mm viền nhôm dây silicone',
                'img': 'https://cdn.tgdd.vn/Products/Images/7077/234917/apple-watch-s6-lte-40mm-vien-thep-day-cao-su-den-thumb-600x600.jpg',
                'price': 19990000,
                'discount': 0
            },
            {
                'name': 'Apple Watch Series 7 LTE 41mm',
                'img': 'https://cdn.tgdd.vn/Products/Images/7077/250639/apple-watch-s7-lte-41mm-vang-thumb-1-660x600.jpg',
                'price': 14990000,
                'discount': 0
            },
            {
                'name': 'Apple Watch SE 44mm viền nhôm dây cao su',
                'img': 'https://cdn.tgdd.vn/Products/Images/7077/229063/apple-watch-se-44mm-vien-nhom-day-cao-su-den-thumb-600x600.jpg',
                'price': 9990000,
                'discount': 0
            },
            {
                'name': 'Apple Watch S6 LTE 44mm viền nhôm dây cao su',
                'img': 'https://cdn.tgdd.vn/Products/Images/7077/234523/s6-lte-44mm-vien-nhom-day-cao-su-xanh-thumb-1-600x600.jpg',
                'price': 15990000,
                'discount': 0
            },
            {
                'name': 'Apple Watch Series 7 LTE 45mm dây thép',
                'img': 'https://cdn.tgdd.vn/Products/Images/7077/250656/apple-watch-series-7-lte-45mm-day-thep-den-thumb-1-660x600.jpg',
                'price': 22990000,
                'discount': 0
            },
        ],
        'Samsung': [
            {
                'name': 'Samsung Galaxy Watch 4 LTE Classic 46mm',
                'img': 'https://cdn.tgdd.vn/Products/Images/7077/248765/samsung-galaxy-watch-4-lte-classic-46mm-den-1-600x600.jpg',
                'price': 9990000,
                'discount': 0
            },
            {
                'name': 'Samsung Galaxy Watch 3 LTE 41mm viền thép dây da',
                'img': 'https://cdn.tgdd.vn/Products/Images/7077/247124/samsung-galaxy-watch-3-41mm-lte-vien-thep-day-da-hong-thumb-1-1-600x600.jpg',
                'price': 10490000,
                'discount': 61
            }
        ]
    }   
}

const cart = loadCart();
const products = loadProducts();
let filter = products;