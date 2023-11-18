if (window.matchMedia("(max-width: 768px)").matches) {
  let search = location.search;
  let path = location.pathname.split("/")[2];
  window.location.href = "/productS2/" + path + search;
}
var data,
  items,
  mainColor,
  photo,
  images,
  // styleid,
  water,
  size,
  spotid,
  deliveryData;
var styleid, Cook, thisColor, search, alert_message, alert_general, product;
var flashTime = 3000;
const parent = "/static/images/parent/";
alert_message = $(".alert-message");
alert_general = $(".alert-general");
var spot_search = location.search;

if (spot_search.split("=")[0] == "?spotid") {
  var spotVal = spot_search.split("=")[1];
  deliveryData = {};
  deliveryData.spotid = spotVal;
  $("#basket-buy").trigger("click");
}

$("#main").on("click", function () {
  var src = $(this).attr("src");

  $(".main-modal")
    .fadeIn(500, function () {
      $(this).focus();
    })
    .css("display", "flex");
  $(".product-container").css("opacity", "0.3");
  $(this).css("display", "none");
  $(".modal-img").attr("src", src);
});

$(".modal-img").on("click", function () {
  let l = images.length;
  let src = $(this).attr("src").split("/");
  let srce = src.pop();
  let base = src.join("/");
  // console.log(src, srce, base, l, images);

  for (let i = 0; i < l; i++) {
    if (images[i].img == srce) {
      let this_source = base + "/" + images[(i + 1) % l].img;
      $(this)
        .fadeOut(300, function () {
          $(this).attr("src", this_source);
        })
        .fadeIn(500);
      $("#main").attr("src", this_source);
      return false;
    }
  }
});

$(".main-modal").on("blur", function () {
  $(this).fadeOut(300);
  $(".product-container").css("opacity", "1");
  $("#main").css("display", "block");
});

$("#delivery option").each(function () {
  $("#delivery").parent().css("background-color", "var(--redBack)");
  $(".address-warning").css("display", "block");
  let value = $(this).val();
  let search = window.location.search.split("=");
  $option = search.slice(1)[0];
  if ($.isNumeric($option)) {
    $("#delivery").val($option);
    $(".address-warning").hide();
    $("#delivery").parent().css("background-color", "var(--greenBack)");
    return false;
  } else if ($.isNumeric(value) && value > 0) {
    $("#delivery").val(value);
    $(".address-warning").hide();
    $("#delivery").parent().css("background-color", "var(--greenBack)");
    return false;
  }
});

$("#delivery").on("change", function () {
  deliveryData = {};
  var value = $(this).val().split("-");
  if (value[0] == "pickup") {
    deliveryData.pickup = value[1];
  } else if (value[0] == 0) {
    let path = location.pathname;
    window.location.href = "/delivery?" + path;
  } else {
    deliveryData.spotid = value[0];
  }
  $("#pmt-link").trigger("click");
});

Cook = getCookies();

function phoneCheck(phone) {
  let arg = {};
  let action = "phonesAuthorized";
  arg.action = action;
  arg.phone = phone;
  // console.log(arg, 'arg')

  promissed = checkPhones(arg);
  promissed.done(function (data) {
    // console.log('phone data', data)
    let showButton = data.authorised;
    if (showButton) {
      $("#avail-global").css("display", "block");
    }
  });
}

$(function () {
  if (Cook.phone) {
    let phone = Cook.phone;
    phoneCheck(phone);
  }
  search = window.location.search;
  water = $("#watermark");
  data = allData.replaceAll("&#39;", '"');
  data = JSON.parse(data);
  styleid = data.styleid;
  items = data.items;
  var sizes = data.sizes.split(",");
  images = data.images;
  photo = data.photo;
  mainColor = getMainColor(); //the whole purpose of function is to pick color from basket
  for (i in items) {
    renderColorQtys(items[i], sizes);
    if (items[i].color == mainColor) {
      render(mainColor, items[i]);
    }
  }
  for (let k in images) {
    if (images[k].color == mainColor) {
      $(".image-icons").each(function () {
        let source = $(this).attr("src");
        let thisImage = source.split("/").slice(-1)[0];
        if (thisImage == images[k].img) {
          $("#main").attr("src", source);
        }
      });
      break;
    }
  }
  $("#btn-promo2").on("click", function () {
    window.location.href = "/register2";
  });
  let spotSearch = location.search.split("=");
  product = spotSearch[0].replace("?", "");
  if (product == "spotid") {
    spotid = spotSearch[1];
    $("#delivery option[value=5]").prop("selected", "selected");
  }
});
$("#product-selected").attr("disabled", "disabled");

// this function returns all  barcodes to the authorized personnel
$("#avail-global").click(function () {
  styleData();
});
function styleData() {
  // $('#info').show()
  let arg = {
    phone: Cook.phone,
    styleid: styleid,
    action: "styleInfo",
  };
  // console.log(arg)
  promissed = getStyleData(arg);
  promissed.done(function (data, state) {
    if (state == "success") {
      stylesDataTable(data);
      $("#info").show();
    }
  });
}
function stylesDataTable(data) {
  // console.log('getStyleData on click:', data)
  let parent = $("#style-data");
  parent.empty();
  let html = "";
  html += '<table id = "orders-table" class="orders-table">';
  let message =
    "Наличие модели " + styleid + " в магазинах по цветам и размерам";
  html += "<caption> <i>" + message + "</i> </caption>";
  html += '<tr class= "tabHeader">';
  let colNames = Object.keys(data[0]);
  for (let c in colNames) {
    html += "<th>" + colNames[c] + "</th>";
  }
  html += "</tr>";
  for (let d in data) {
    html += '<tr class ="table-rows">';
    let row = Object.values(data[d]);
    for (let i in row) {
      html += "<td>" + row[i] + "</td>";
    }
    html += "</tr>";
  }
  html += "</table>";
  parent.append(html);
}
function getStyleData(args) {
  // console.log('arg getStyleData: ', args)
  return $.ajax({
    type: "POST",
    url: "/hr",
    data: JSON.stringify(args),
    contentType: "application/json",
    dataType: "json",
  });
}

function checkPhones(arg) {
  return $.ajax({
    type: "POST",
    url: "/hr",
    data: JSON.stringify(arg),
    contentType: "application/json",
    dataType: "json",
  });
}
function closeInfo() {
  $("#info").hide();
}

// this function renders the colors table
function renderColorQtys(arg, sizes) {
  $(".color-wrap").each(function () {
    $wrap = $(this);
    let color = $.trim($(this).text());
    if (color == arg.color) {
      let qtys = arg.qtys;
      // console.log('renderColorQtys: ', color, qtys)
      for (let q in qtys) {
        let index = sizes.indexOf(qtys[q].size);
        let quantity = qtys[q].qty.toString();
        $wrap
          .closest(".left")
          .siblings(".right")
          .find(".column")
          .eq(index)
          .addClass("avail")
          .css("text-decoration", "none")
          .css("cursor", "pointer");
        $wrap
          .closest(".left")
          .siblings(".right")
          .find(".quantity")
          .eq(index)
          .text(quantity);
      }
    }
  });
}

// procedure pick the color of main image from Flask rendering
// unless the page was redirected to from basket
// if it was then image clicked in basket becomes main
function getMainColor() {
  var mainColor = data.color;
  if (search) {
    let x = search.split("?")[1].split("=");
    if (search.includes("?")) {
      if (x[0] == "color") {
        mainColor = x[1].replaceAll("&#39;", "").replaceAll("%20", " ");
      }
    }
  }
  $(".color-wrap").each(function () {
    let color = $.trim($(this).text());
    if (color == mainColor) {
      $(this).closest(".left").addClass("active");
    }
  });
  return mainColor;
}

// this the proc that sets the default image of the page
function render(color, items) {
  let columns = $(".column");
  let colors = $(".color");
  let sizes = $(".sizes");
  let qtys = $(".quantities");
  columns.removeClass("col-color");
  colors.removeClass("active");
  colors.each(function () {
    if ($(this).text() == color) {
      $(this).addClass("active");
      sizes.each(function (index) {
        items.qtys.forEach((element) => {
          if (element.size == $(this).text()) {
            columns.eq(index).addClass("col-color");
            qtys.eq(index).text(element.qty);
          }
        });
      });
    }
  });
  if (Cook.phone) {
    $("#btn-promo2").hide();
    promissed = getBasketContent();
    promissed.done(function (data) {
      $("#this-qty").text("");
      $("#basket-total").text(data.total);
      let curr_size = $("#product-selected");
      let qtyBox = $("#quantity");
      curr_size.removeClass("filled");
      curr_size.val("");
      qtyBox.removeClass("filled");
      qtyBox.val("");
    });
  }
}

// select size and quantity for "one click" and for "add to basket"
// this proc have a response in a form of an object {"this": , "total":} with alreadyInBasket proc
$(".column").click(function () {
  let selection = $("#product-selected");
  let qtyBox = $("#quantity");
  selection.removeClass("filled").val("");
  qtyBox.removeClass("filled").val("");
  let index, column;
  if ($(this).hasClass("avail")) {
    $(".column").removeClass("size-selected");
    $(".left").removeClass("size-selected").removeClass("active");
    $(".column-sizes").removeClass("size-selected");
    column = $(this);
    index = $(this).index();
    let the_size = column
      .closest(".product-info-section")
      .find(".column-sizes")
      .eq(index);
    the_size.addClass("size-selected");
    size = the_size.find(".sizes").text();
    column.addClass("size-selected");
    column
      .closest(".container-sizes")
      .find(".left")
      .addClass("size-selected")
      .addClass("active");
    let color = $.trim(
      column.closest(".container-sizes").find(".color-wrap").text()
    );
    src_error = "/static/images/error2.png";
    let src, img;
    $("#main").attr("src", src_error);
    $(".image-icons").each(function () {
      src = $(this).attr("src");
      img = src.split("/").slice(-1)[0];
      for (let j in images) {
        if (images[j].color == color && images[j].img == img) {
          $("#main").attr("src", src).css("display", "");
          return false;
        }
      }
    });
    let text = "Выбор - цвет: " + color + ",  размер: " + size;
    selection.addClass("filled").val(text);
    qtyBox.addClass("filled").val(1);
    thisColor = color;
    let data = getItemData("sizeQuantities");
    alreadyInBasket(data);
  }
});

// click on colors section to make color active
$(".left").click(function () {
  let selection = $("#product-selected");
  let qtyBox = $("#quantity");
  selection.removeClass("filled").val("");
  qtyBox.removeClass("filled").val("");
  let sizes = $(".right").eq(0);
  $(".left").removeClass("active").removeClass("size-selected");
  $(this).addClass("active").addClass("size-selected");
  let thisSizeIndex = sizes.find(".size-selected").index();

  if (thisSizeIndex != -1) {
    let size = $.trim(sizes.find(".column-sizes").eq(thisSizeIndex).text());
    // console.log(size)
    $(".column").removeClass("size-selected");
    let qty = $(this)
      .closest(".container-sizes")
      .find(".column")
      .eq(thisSizeIndex);
    // qty.css('background', 'red')
    if (qty.hasClass("avail")) {
      qty.addClass("size-selected");
      let color = $.trim($(this).text());
      let text = "Выбор - цвет: " + color + ",  размер: " + size;
      selection.addClass("filled").val(text);
      qtyBox.addClass("filled").val(1);
      thisColor = color;
      let data = getItemData("sizeQuantities");
      alreadyInBasket(data);
    } else {
      $(".column-sizes").removeClass("size-selected");
    }
  }
  thisColor = $.trim($(this).text());

  for (let i in images) {
    let color = images[i].color;
    let img = images[i].img;
    if (color == thisColor) {
      let source = parent + styleid + "/800/" + img;
      $("#main").attr("src", source);
      break;
    }
  }
});

// change active color and main picture
$(".image-icons").click(function () {
  let sizeSelectedIndex;
  let thisColorIndex;
  let source = $(this).attr("src");
  let thisImage = source.split("/").slice(-1)[0];
  $(".column").removeClass("size-selected"); //это оставить
  $(".left").removeClass("size-selected").removeClass("active");
  for (let i in images) {
    img = images[i].img;
    if (img == thisImage) {
      thisColorIndex = images[i].color;
    }
  }
  let colors = $(".left");
  colors.each(function (index) {
    let color = $.trim($(this).text());
    if (color == thisColorIndex) {
      $(this).addClass("active");
      thisColorIndex = index;
      // console.log(index, ': ', $.trim($(this).text()))
    }
  });
  let sizes = $(".column-sizes");
  sizes.each(function (index) {
    let size = $.trim($(this).text());

    if ($(this).hasClass("size-selected")) {
      sizeSelectedIndex = index;
    }
  });
  let qtys = $(".right");
  qtys.removeClass("size-selected").removeClass("active");
  qtys.each(function (index) {
    if (index == thisColorIndex) {
      thisQty = $(this).find(".column").eq(sizeSelectedIndex);
      if (thisQty.hasClass("avail")) {
        // $(this).find('.column').eq(sizeSelectedIndex).css('background', 'red')
        thisQty.addClass("size-selected");
      } else {
        sizes.removeClass("size-selected");
      }
    }
  });
  $("#main").attr("src", source);
  // water.removeClass('watermark')
});

let sizes = $(".column-sizes");
sizes.click(function () {
  let selection = $("#product-selected");
  let qtyBox = $("#quantity");
  selection.removeClass("filled").val("");
  qtyBox.removeClass("filled").val("");
  let activeColorIndex;
  sizes.removeClass("size-selected");
  clickedSizeIndex = $(this).index();
  $(".left").each(function (index) {
    if ($(this).hasClass("active")) {
      activeColorIndex = index;
      // console.log(activeColorIndex)
    }
  });
  let qtys = $(".right");
  $(".column").removeClass("size-selected");
  let qty = qtys.eq(activeColorIndex).find(".column").eq(clickedSizeIndex);
  if (qty.hasClass("avail")) {
    $(this).addClass("size-selected");
    qty.addClass("size-selected");
  }
  let size = $.trim($(this).text());
  let color = $.trim($(".left").eq(activeColorIndex).text());
  // console.log(color)

  let text = "Выбор - цвет: " + color + ",  размер: " + size;
  selection.addClass("filled").val(text);
  qtyBox.addClass("filled").val(1);
  thisColor = color;
  let data = getItemData("sizeQuantities");
  alreadyInBasket(data);
});

// one click buy procedure
$(".basket-buy").click(function () {
  // if (!Cook.phone) {
  //   flashMessage('для покупки требуется авторизация', false, flashTime)
  //   return false
  // }
  let fin_price;
  if (sizeSelected()) {
    $("#current-size").text("размер: " + size);
    $("#myModal").css("display", "block");
    $(".product-container").css("opacity", "0.2");
    $("#one-click-qty").text("Количество: " + $("#quantity").val());
    let final = parseInt(
      $("#final-price").text().split(" ")[0].replace(",", "")
    );
    fin_price = $("#quantity").val() * final;
    let final_price = fin_price.toLocaleString("en-US") + " руб.";
    $("#final-price").text(final_price);
    $("#back-to-shop").click(function (event) {
      event.preventDefault();
      $("#myModal").css("display", "none");
      $(".product-container").css("opacity", "1");
    });
  }
});

$(".pmt-logo").each(function () {
  $(this).click(function () {
    let thePhone = {};
    let inv = [];
    let fin_price;
    let arg = Cook.phone;
    let final = parseInt(
      $("#final-price").text().split(" ")[0].replace(",", "")
    );
    fin_price = $("#quantity").val() * final;
    let styleData = addStyleData(arg);
    styleData.qty = $("#quantity").val();
    styleData.total = fin_price;
    let id = $("#delivery").val().split("-");
    if (id[0] == "spotid") {
      thePhone.spotid = id[1];
    }
    if (id[0] == "pickup") {
      thePhone.pickupid = id[1];
    }
    thePhone.phone = arg;
    thePhone.orderTotal = fin_price;
    thePhone.Session = Cook.Session;
    let delData = $("#delivery").val();
    if (delData.split("-")[0] == "pickup") {
      thePhone.pickupid = delData.split("-")[1];
    } else {
      thePhone.spotid = delData.split("-")[0];
    }
    inv[0] = styleData;
    inv.unshift(thePhone);
    let pmtSys = $(this).attr("id");
    if (pmtSys == "yandex") {
      pmtSys = "tinkoff";
    }
    thePhone.procName = "ONE_CLICK";
    thePhone.pmtSys = pmtSys;
    paymentLink(inv);
  });
});

// add to basket procedure
$("#addBasket").click(function () {
  if (sizeSelected()) {
    let current = $(".column.size-selected").find(".quantity").text();
    let max = current - $("#this-qty").text();
    let qtyAdded = $("#quantity").val();
    if (qtyAdded > max) {
      flashMessage("Превышено максимальное количество", false, flashTime);
      $("#quantity").val(0);
      return false;
    }
    let data = getItemData("insert");
    let qty = data.qty;
    promissed = addToBasket(data);
    promissed.done(function (data) {
      if (data.error) {
        flashMessage(data.error, false, flashTime);
        return false;
      } else {
        flashMessage(`в корзину добавлено: ${qtyAdded} ед товара`, true);
        document.querySelector("#this-qty").innerHTML = data.this;
        // console.log('desktop, #this qty: ', data.this)
        document.querySelector("#basket-total").innerHTML = data.total;
      }
    });
  }
});

// close alert window button
$(".OK").click(function () {
  $(".product-container").css("opacity", "1");
  $(".alert-general").css("display", "none");
});

// procedure checks if size is selected for to buy with one click or
// add to basket
function sizeSelected() {
  let time = 2500;
  var Selected = $("#product-selected").val();
  if (Selected == "") {
    $(".product-container").css("opacity", "0.6");
    flashMessage("Выберите цвет и размер", false, time);
    setTimeout(function () {
      $(".product-container").css("opacity", "1");
    }, time);
    return false;
  } else {
    return true;
  }
}

//if phone or Session cookies get Basket data;
function getBasketContent() {
  user = {
    phone: Cook.phone,
    uuid: Cook.Session,
    procName: "initialize",
  };
  let obj = [user];
  if (user.phone || user.uuid) {
    return $.ajax({
      type: "POST",
      url: "/sortCodeQty",
      data: JSON.stringify(obj),
      contentType: "application/json",
      dataType: "json",
      success: function (data, state) {},
    });
  } else {
    $("#this-qty").text(0);
    $("#basket-total").text(0);
  }
}

// returns the data needed to run ajax request
function getItemData(proc) {
  user = {
    phone: Cook.phone,
    uuid: Cook.Session,
    procName: proc,
  };
  item = {
    styleid: styleid,
    color: thisColor,
    size: size,
    qty: $("#quantity").val(),
  };
  itemData = [user, item];
  return itemData;
}

function addToBasket(arg) {
  return $.ajax({
    type: "POST",
    url: "/goToBasket",
    data: JSON.stringify(arg),
    contentType: "application/json",
    dataType: "json",
  });
}

function getCookies() {
  let Cookies = {};
  if (document.cookie == "") {
    Cookies["cookies"] = "no coockies";
  }
  document.cookie.split("; ").forEach((el) => {
    el = el.replaceAll('"', "");
    c = el.split("=");
    Cookies[c[0]] = c[1];
  });
  return Cookies;
}

function addStyleData(arg) {
  let b_data = new Object();
  b_data.color = thisColor;
  b_data.size = size;
  b_data.styleid = styleid;
  b_data.price = data.price;
  b_data.discount = data.discount;
  b_data.promo = data.promo;
  b_data.total = data.price * (1 - data.discount) * (1 - data.promo);
  return b_data;
}

function paymentLink(args) {
  data_str = JSON.stringify(args);
  $.ajax({
    type: "POST",
    url: "/basket_actions",
    data: JSON.stringify(args),
    contentType: "application/json",
    dataType: "json",
    success: function (data, state) {
      window.location.href = data;
    },
    error: function (err) {
      // console.log(err.responseText, ': error ', err) // <-- printing error message to console
    },
  });
}

function alreadyInBasket(arg) {
  $.ajax({
    type: "POST",
    url: "/sortCodeQty",
    data: JSON.stringify(arg),
    contentType: "application/json",
    dataType: "json",
    success: function (data, state) {
      data = data == "None" ? 0 : data;
      document.querySelector("#this-qty").innerHTML = data.this;
      document.querySelector("#basket-total").innerHTML = data.total;
    },
  });
}

$("#go-to-basket").on("click", function () {
  window.location.href = "/basket";
});
