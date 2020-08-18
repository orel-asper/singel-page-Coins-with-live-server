//spinner
$(document).ready(() => {
  $("#fatherDiv").hide();
  localStorage.clear();
})

//first page api build all the card coins 
let firstUrl = "https://api.coingecko.com/api/v3/coins/list/"
$.get(firstUrl, (data) => {
  // yossi if you want the 8000 coins you can add data to the each loop instead Slice
  Slice = data.slice(0, 100);
  $.each(Slice, (i) => {
    $("div#divTag").append(
      `<div class="card col-sm-6 col-md-4 col-lg-3 col-xl-2 shadow-lg mb-4 bg-white">
          <div class="card-body">
          <h5 class="card-title">${data[i].symbol.toUpperCase()}</h5>
          <p class="card-text">${data[i].name}</p>
          <p class="card-text" id='${data[i].id}'style='display:none'></p>
          <button class="btn btn-primary" type="button" data-toggle="collapse"id='${data[i].id}'>More info</button>
          <div class="custom-control custom-switch">
          <input type="checkbox" class="custom-control-input" id="${data[i].symbol + ` `}">
          <label class="custom-control-label" for="${data[i].symbol + ` `}">add to live report</label>
          </div>
          </div>
          </div>
          </div>`
    );
  })

  //counter for the coin that will be on the live report
  let LastCoin = ''
  let showModal = (checkbox) => {
    LastCoin = checkbox.id.match(/(.*)/)
    $('form :submit', myModal).prop('disabled', true);
  }
  // popup modal with chosen coins and Check if there is no information about the coin and cancel it
  let currentCoins = [];
  let fiveCoins = [];
  let coinindex = ''
  $(`.custom-control-input`).on("change", (e) => {
    let maxCoins = 5
    const updateCoins = (id) => {
      !currentCoins.includes(id) ? currentCoins.push(id) : (coinindex = currentCoins.indexOf(id), currentCoins.splice(coinindex, 1))
    }
    updateCoins(e.target.id)
    fiveCoins = currentCoins.slice(0, 5)
    $(`#sorry`).empty()
    let coinsToCheck = e.target.id.slice(0, -1)
    let thirdUrl = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinsToCheck}&tsyms=EUR,USD`
    $.get(thirdUrl, (data) => {
      if (data.HasWarning === true) {
        coinindex = currentCoins.indexOf(e.target.id), currentCoins.splice(coinindex, 1)
        $(`[id='${e.target.id}']`).prop('checked', false)
        $(`#sorry`).append(`sorry no information for this coin`).show().fadeOut(2000)
      }
    }).done(() => {
      if (currentCoins.length > maxCoins) {
        showModal(e.target)
        $('#getMeToggleCoins').empty()
        $.each(fiveCoins, (i, coin) => {
          $('#getMeToggleCoins').append(`
                <div class="card col-sm-2 col-md-4 col-lg-3 col-xl-4 shadow-lg mb-4 bg-white">
                <h5 class="card-title">${currentCoins[i].toUpperCase()}</h5>
                <div class="custom-control custom-switch">
                <input type="checkbox" checked data-toggle="toggle" class="custom-control-input" id="${coin + -1}">
                <label class="custom-control-label" for="${coin + -1}"></label></div></div>`)
          $('#myModal').modal({ backdrop: false, show: true })
          $(`[id='${coin + -1}']`).on('change', (e) => {
            $(`[id='${coin}']`).prop('checked', (i, value) => {
              return !value;
            })
            updateCoins(coin)
          })
        })
      }
    })
  })

  //modal cancel changes
  let modalCoins = []
  $('#CancelChanges').on('click', () => {
    currentCoins.map((value, i) => {
      if (!LastCoin.indexOf(value) === true) {
        currentCoins.splice(i, 1)
        $(`[id='${value}']`).prop('checked', false)
      } else {
        modalCoins.push(value)
        $(`[id='${value}']`).prop('checked', true)
      }
    })
    $.each(fiveCoins, (i, value) => {
      if ($(`[id='${value}']`).prop('checked', true) && !currentCoins.includes(value)) {
        $(`[id='${value}']`).prop('checked', true)
        currentCoins.push(value)
      }
    })
  })
  //modal save changes
  $('#SaveChanges').click((e) => {
    e.preventDefault();
    currentCoins.length > 5 ? ($('#SaveChanges').prop('disabled', true)) : $('#myModal').modal('hide')
  });

  // get the secondary api
  $("button").click((e) => {
    e.preventDefault();
    if ($(`p#${e.target.id}`).css('display') === 'none') {
      $(e.currentTarget).text('Loading... ').append(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`)
    }
    let secondUrl = `https://api.coingecko.com/api/v3/coins/${e.target.id}`
    $.get(secondUrl, (data) => {
    }).done((data) => {
      if (!localStorage.getItem(data.id)) {
        objFromApi = data
        jsonObj = JSON.stringify(objFromApi)
        localStorage.setItem(data.id, jsonObj)
      }
      text = localStorage.getItem(data.id)
      ParseObj = JSON.parse(text)
      $(`p#${e.target.id}`).empty();
      $(`p#${e.target.id}`).append(`
      <div class="card border-primary p-4">
      <img class="card-img-top img-thumbnail rounded border-dark" src='${ParseObj.image.large}'>
      <div class="card-body d-flex flex-column align-items-center" id='${ParseObj.coingecko_rank}'>
      </div>
      </div>
      </label>
      </div>`);
      $.when().then(() => {
        if (data.market_data.current_price.usd === undefined) {
          $(`#${data.coingecko_rank}`).append(`
          <h5>no information for this coin yet!</h5>`)
        } else {
          $(`#${data.coingecko_rank}`).append(`
          <h5>&#8362;${data.market_data.current_price.ils}</h5>
          <h5>&dollar;${data.market_data.current_price.usd}</h5>
          <h5>&euro;${data.market_data.current_price.eur}</h5>`)
        }
      }).done(() => {
        $(e.currentTarget).text('More info')
        $(`#${e.target.id}`).slideToggle('slow');
        //delete the new data from CACHE every 2min 
        setTimeout(() => {
          localStorage.removeItem(data.id);
        }, 2 * 60 * 1000);
      })
    }).fail(() => {
      console.log("The ajax call to the JSON file has failed");
    })
  })

  // search button
  $('#searchBtn').click(() => {
    let status = false
    $('#searchBtn').text('Search')
    $('#divTag').children().show()
    let inp = $('#inp').val().toLowerCase();
    $('#divTag').children().filter((i) => {
      let div = $(`#divTag > div:nth-child(${i + 1}) > div > h5`).text().toLowerCase();
      if (inp === div) {
        status = true
        $('#divTag').children().hide()
        $('#inp').val('')
        $('#searchBtn').text('return to all')
        return div
      }
    }).show()
    status ? $('#sorry').hide() : $('#sorry').show().text('sorry wrong coin name').fadeOut(2000)
  })
  $(inp).on("keyup", (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      $('#searchBtn').click();
    }
  })

  // live report
  let Updateinterval
  $("#live-report").click(() => {
    $('#searchBtn').hide()
    $('#inp').hide()
    $('div#canvas').empty()
    $('#about').empty()
    $("div#canvas").show()
    $("#divTag").children().hide()
    let coinsToReport = currentCoins.map((a) => a.toUpperCase().slice(0, -1))
    if (coinsToReport.length > 0) {
      let ChartDataCoins = []
      let UpdateChart = []
      let total = [[], [], [], [], []]
      $('div#canvas').append(`<div id="chartContainer" style="height: 100%; width: 100%;"></div>`)
      let options = {
        exportEnabled: true,
        animationEnabled: true,
        title: {
          text: "Cryptonite coins live report"
        },
        subtitles: [{
          text: "Click at the coin to Hide or Unhide Data Series"
        }],
        axisX: {
          title: "time"
        },
        axisY: {
          title: "Coin Value in USD",
          titleFontColor: "#4F81BC",
          lineColor: "#4F81BC",
          labelFontColor: "#4F81BC",
          tickColor: "#4F81BC"
        },
        toolTip: {
          shared: true
        },
        legend: {
          cursor: "pointer",
          itemclick: toggleDataSeries
        },
        data: ChartDataCoins
      }
      $("#chartContainer").CanvasJSChart(options);

      function toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
          e.dataSeries.visible = false;
        }
        else {
          e.dataSeries.visible = true;
        }
        e.chart.render();
      }

      let thirdUrl = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinsToReport}&tsyms=USD`
      let update = () => {
        $.get(thirdUrl, (data) => {
          $.each(coinsToReport, (i, name) => {
            total[i].push({ x: new Date(), y: data[name].USD })
            UpdateChart[i] = total[i]
          })
          $("#chartContainer").CanvasJSChart().render();
        })
      }
      update()
      $.get(thirdUrl, () => {
        $.each(coinsToReport, (i, coin) => {
          let OneCoinData = {
            type: "spline",
            name: `${coin}`,
            showInLegend: true,
            xValueFormatString: 'hh:mm:ss TT',
            yValueFormatString: `$###,###.#######`,
            dataPoints: UpdateChart[i]
          }
          ChartDataCoins.push(OneCoinData)
        })
      })
      update()
      Updateinterval = setInterval(update, 2000)
    }
  })
  // change between home and chart
  $("#Home").click(() => {
    clearInterval(Updateinterval)
    $('#searchBtn').show()
    $('#inp').show()
    $("div#canvas").empty()
    $("#divTag").children().show()
    $('#about').empty()
  })
  $('#about-tab').click(() => {
    $('#about').empty()
    clearInterval(Updateinterval)
    $("div#canvas").empty()
    $("#divTag").children().hide()
    $('#searchBtn').hide()
    $('#inp').hide()
    $('#about').append(`<div class="jumbotron">
    <img src="./1.jpg" class="rounded-circle float-right" alt="Cinque Terre" width="304" height="236"> 
    <h1 class="display-4">About</h1>
    <h4 class="lead">My name is Orel asper and I'm 26 years old.</h4>
    <p>This project was made by me as one of the John Bryce's test projects.</p> 
    <h5><b>At</b> the begining everythig in the development of this project went well, but after the easy part soon i started to realize how much more difficult it is, from here to there after hard work I've managed to complete it.  Hopefuly you'd like it</h5> 
    <hr class="my-4">
    <p>credits - https://api.coingecko.com/api/v3/coins/list/, https://min-api.cryptocompare.com/data/, https://canvasjs.com/</p>
    </div>`)
  })

  // scroll back to top
  $(window).scroll(function () {
    if ($(this).scrollTop() > 50) {
      $('#back-to-top').fadeIn();
    } else {
      $('#back-to-top').fadeOut();
    }
  });
  // scroll body to 0px on click
  $('#back-to-top').click(function () {
    $('body,html').animate({
      scrollTop: 0
    }, 400);
    return false;
  });

}).then(() => {
  $("#spinner").fadeOut(1000)
  $("#fatherDiv").show();
})






