const roundToTwoDecimals = (value) => {
  return Math.floor(value * 100) / 100;
};

const findSign = (value) => {
  /* Used for determining label for class insertion
   * in order to change the font color on priceChange
   * an pctPriceChange fields
   *
   * Used inside displayStockData function (see displayStringTemplate)
   *
   * @param {number} value. The value's sign which is being determined
   * @return {string}.      Label that is appended to a specific class
   */

  if (value > 0) {
    return 'positive';
  } else if (value < 0) {
    return 'negative';
  } else {
    return 'neutral';
  }
};

const displayStockData = (fetchedData) => {
  /* Used for displaying stock data in the card body
   *
   * @param {Object} fetchedData.
   *
   * FetchedData.stocks is an array
   * of objects. Each object is unique to a stock.
   * Relevant information is extracted and parsed to a string
   * template. A div node (stockRowNode) is created with its
   * corresponding styling. The string template is added to
   * the parent node (stockRowNode). The latter is appended
   * as a child element to the StockDisplay node which is the
   * card's body main display area.
   *
   * This function utilizes the following functions:
   *  - roundToTwoDecimals
   *  - findSign
   *
   * This functions is used by the following functions:
   *  - fetchAndDisplayStockData
   *  - sortByName
   *  - sortByPrice
   *
   */

  for (const stockEntry of fetchedData.stocks) {
    const symbol = stockEntry.symbol;
    const companyName = stockEntry.companyName;
    const website = stockEntry.companyWebSite;
    const currentPrice = stockEntry.currentPrice;
    const priceChange = roundToTwoDecimals(stockEntry.currentPrice - stockEntry.previousClose);
    const pctPriceChange = roundToTwoDecimals((priceChange / stockEntry.previousClose) * 100);

    const displayStringTemplate =
      `
        <div class="col-md-2 stock-text-neutral text-center my-auto" id="symbol_${symbol}">${symbol}</div>
        <div class="col-md-4 stock-text-neutral text-center my-auto" id="coName_${symbol}">
          <a href="` +
      `${website}` +
      `" class="company-link" target="_blank">${companyName}</a>
        </div>
        <div class="col-md-2 stock-text-neutral text-center my-auto" id="price_${symbol}">${currentPrice}</div>
        <div class="col-md-2 stock-text-` +
      `${findSign(priceChange)}` +
      ` text-center my-auto" id="change_${symbol}">${priceChange}</div>
        <div class="col-md-2 stock-text-` +
      `${findSign(priceChange)}` +
      ` text-center my-auto" id="pctChange_${symbol}">${pctPriceChange}%</div>
      `;

    stockDisplay = document.getElementById('stock-body-display');
    stockRowNode = document.createElement('div');
    stockRowNode.classList.add('row', 'rounded', 'data-row', 'py-2', 'justify-content-between');
    stockRowNode.innerHTML = displayStringTemplate;
    stockDisplay.appendChild(stockRowNode);
  }
};

const fetchAndDisplayStockData = async (url) => {
  /* Used to make a get request at the url, and
   * then calls displayStockData to parse the
   * jsonified response and display the data
   *
   * @param {string} url. Contains API enpoint which returns
   * stock data
   *
   * This function utilizes the following functions:
   *  - displayStockData
   */

  try {
    let response = await fetch(url);
    let fetchedData = await response.json();

    displayStockData(fetchedData);

    return fetchedData;
  } catch (err) {
    console.log(err);
  }
};

const refreshStockData = async (url) => {
  /* Makes a get request at the designated url,
   * fetches the data and runs it through a loop which then
   * extracts the values for the fields to be displayed.
   * Prices that need to be refreshed and displayed
   * should only be those whose prices have changed.
   * Then, nodes with values that are to be selected are updated,
   * its styling color is adjusted, and flickered to guided the eye
   * to the row that has been updated. Finally, the class that allows
   * for flickering is removed.
   *
   * @param {string} url. Contains API enpoint which returns
   * stock data
   *
   * @return {object} refreshedData. An object with the field stocks, which
   * is and array of objects, each one corresponding to a stock.
   *
   * This function utilizes the following functions:
   *  - roundToTwoDecimalPlaces
   */

  try {
    let response = await fetch(url);
    refreshedData = await response.json();

    for (const stock of refreshedData.stocks) {
      const symbol = stock.symbol;
      const newPrice = stock.currentPrice;
      const oldPrice = document.getElementById(`price_${symbol}`).innerText * 1;
      const previousClose = stock.previousClose;

      if (newPrice !== oldPrice) {
        const newPriceChange = roundToTwoDecimals(newPrice - previousClose);
        const newpctPriceChange = roundToTwoDecimals((newPriceChange / previousClose) * 100);

        document.getElementById(`price_${symbol}`).innerText = newPrice;
        document.getElementById(`change_${symbol}`).innerText = newPriceChange;
        document.getElementById(`pctChange_${symbol}`).innerText = newpctPriceChange + '%';

        if (newPriceChange < 0) {
          document.getElementById(`change_${symbol}`).classList.remove('stock-text-positive');
          document.getElementById(`change_${symbol}`).classList.add('stock-text-negative');

          document.getElementById(`pctChange_${symbol}`).classList.remove('stock-text-positive');
          document.getElementById(`pctChange_${symbol}`).classList.add('stock-text-negative');

          document.getElementById(`change_${symbol}`).classList.add('blink-text-negative');
          document.getElementById(`pctChange_${symbol}`).classList.add('blink-text-negative');

          setTimeout(() => {
            document.getElementById(`change_${symbol}`).classList.remove('blink-text-negative');
            document.getElementById(`pctChange_${symbol}`).classList.remove('blink-text-negative');
          }, 800);
        } else if (newPriceChange > 0) {
          document.getElementById(`change_${symbol}`).classList.remove('stock-text-negative');
          document.getElementById(`change_${symbol}`).classList.add('stock-text-positive');

          document.getElementById(`pctChange_${symbol}`).classList.remove('stock-text-negative');
          document.getElementById(`pctChange_${symbol}`).classList.add('stock-text-positive');

          document.getElementById(`change_${symbol}`).classList.add('blink-text-positive');
          document.getElementById(`pctChange_${symbol}`).classList.add('blink-text-positive');

          setTimeout(() => {
            document.getElementById(`change_${symbol}`).classList.remove('blink-text-positive');
            document.getElementById(`pctChange_${symbol}`).classList.remove('blink-text-positive');
          }, 800);
        }
      }
    }

    return refreshedData;
  } catch (err) {
    console.log(err);
  }
};

const sortByName = (currentData, order) => {
  /* Used for sorting stocks by name. It is passed in
   * as an argument to .sort, the latter is called by event
   * listeners which are on the icons next to the Company Name label.
   *
   * @param {Object} currentData. Object to be sorted containing stocks
   * and respective info
   *
   * @param {string} order. Either ascending or descending. Used to
   * determine how the data should be sorted.
   */

  const sortFactor = order === 'ascending' ? 1 : -1;

  currentData.stocks.sort(function (a, b) {
    var nameA = a.companyName.toUpperCase(); // ignore upper and lowercase
    var nameB = b.companyName.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1 * sortFactor;
    }
    if (nameA > nameB) {
      return 1 * sortFactor;
    }
    return 0;
  });

  // Clear display
  document.getElementById('stock-body-display').innerHTML = '';
  // display sorted data
  displayStockData(currentData);
};

const sortByPrice = (currentData, order) => {
  /* Used for sorting stocks by price. It is passed in
   * as an argument to .sort, the latter is called by event
   * listeners which are on the icons next to the Price label.
   *
   * @param {Object} currentData. Object to be sorted containing stocks
   * and respective info
   *
   * @param {string} order. Either ascending or descending. Used to
   * determine how the data should be sorted.
   */

  const sortFactor = order === 'ascending' ? 1 : -1;

  currentData.stocks.sort(function (a, b) {
    var priceA = a.currentPrice;
    var priceB = b.currentPrice;
    if (priceA < priceB) {
      return -1 * sortFactor;
    }
    if (priceA > priceB) {
      return 1 * sortFactor;
    }
    return 0;
  });

  // Clear display
  document.getElementById('stock-body-display').innerHTML = '';
  // display sorted data
  displayStockData(currentData);
};

let currentData;
const url = 'http://127.0.0.1:3000/api/stocks';

fetchAndDisplayStockData(url).then((data) => (currentData = data));

setInterval(async () => {
  /* Sets the refresh rate of displayed data in milliseconds */
  currentData = await refreshStockData(url);
}, 6000);

// Event listeners for sorting by name or price. It toggles classes
// which are used to outline the icon that was clicked on.
document.getElementById('sortByNameAsc').addEventListener('click', () => {
  sortByName(currentData, 'ascending');
  document.getElementById('sortByNameAsc').classList.add('sort-active');
  document.getElementById('sortByNameDesc').classList.remove('sort-active');
  document.getElementById('sortByPriceDesc').classList.remove('sort-active');
  document.getElementById('sortByPriceAsc').classList.remove('sort-active');
});

document.getElementById('sortByNameDesc').addEventListener('click', () => {
  sortByName(currentData, 'descending');
  document.getElementById('sortByNameDesc').classList.add('sort-active');
  document.getElementById('sortByNameAsc').classList.remove('sort-active');
  document.getElementById('sortByPriceDesc').classList.remove('sort-active');
  document.getElementById('sortByPriceAsc').classList.remove('sort-active');
});

document.getElementById('sortByPriceAsc').addEventListener('click', () => {
  sortByPrice(currentData, 'ascending');
  document.getElementById('sortByPriceAsc').classList.add('sort-active');
  document.getElementById('sortByPriceDesc').classList.remove('sort-active');
  document.getElementById('sortByNameAsc').classList.remove('sort-active');
  document.getElementById('sortByNameDesc').classList.remove('sort-active');
});

document.getElementById('sortByPriceDesc').addEventListener('click', () => {
  sortByPrice(currentData, 'descending');
  document.getElementById('sortByPriceDesc').classList.add('sort-active');
  document.getElementById('sortByPriceAsc').classList.remove('sort-active');
  document.getElementById('sortByNameAsc').classList.remove('sort-active');
  document.getElementById('sortByNameDesc').classList.remove('sort-active');
});
