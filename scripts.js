(() => {
  const API_ADDRESS = "http://data.fixer.io/api/latest?access_key=API_KEY_GOES_HERE&symbols=USD,JPY,EUR";

  const storage = window.localStorage;

  const form = document.querySelector(".js-currency_converter_form");
  const amount = form.querySelector("input[name='amount']");
  const conversion_history_container = document.querySelector(".js-conversion_history");

  const fetchData = async () => {
    // const response = await axios.get(API_ADDRESS /* &base=USD gives API restriction */);
    // return response.data;

    const fakeResponse = {
      success: true,
      timestamp: 1598550847,
      base: "EUR",
      date: "2020-08-27",
      rates: {
        EUR: 1,
        JPY: 125.977016,
        USD: 1.181579,
      },
    };

    return fakeResponse;
  };

  const converter = (amount, source, target, rates) => {
    if (source === target) {
      return amount;
    }

    // from here on, we're manually converting rates
    // this is due to API limitation of monetising their converter
    // so we use the EUR as base, then calculate other bases accordingly
    // not ideal, but gets the job done
    if (source === "EUR") {
      return rates[target] * amount;
    }

    // first paranthesis calculates the rate against EUR
    return (100 / rates[source] / 100) * amount * rates[target];
  };

  const updateResult = async () => {
    const source = form.querySelector("input[name='source']:checked");
    const target = form.querySelector("input[name='target']:checked");
    const result = document.querySelector(".js-result");

    const fetchedData = await fetchData(); // gets rates for base EUR
    const convertedAmount = converter(amount.value, source.value, target.value, fetchedData.rates);
    result.textContent = `${target.value} ${Number(convertedAmount).toFixed(2)}`;

    // persistency
    const historical_conversions = storage.getItem("conversion_history");

    const newHistory = [`${source.value}${amount.value}: ${target.value}${Number(convertedAmount).toFixed(2)}`];

    historical_conversions && newHistory.push(...JSON.parse(historical_conversions).splice(0, 10));

    localStorage.setItem("conversion_history", JSON.stringify(newHistory));

    const ulEl = document.createElement("ul");

    newHistory.map((item) => {
      const liEl = document.createElement("li");
      liEl.appendChild(document.createTextNode(item));
      ulEl.appendChild(liEl);
    });

    // todo: doesn't seem to be ideal
    // maybe only remove last li and add new li on top?
    conversion_history_container.innerHTML = "";
    conversion_history_container.appendChild(ulEl);
  };

  const init = () => {
    updateResult();

    [...form.querySelectorAll("input[type='radio']")].map((el) =>
      el.addEventListener("change", function () {
        updateResult();
      })
    );

    amount.addEventListener("input", function () {
      updateResult();
    });
  };

  init();
})();
