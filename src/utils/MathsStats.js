// @ts-nocheck
export function calculateStandardDeviation(arr) {
  // Step 1: Calculate the mean (average) of the array
  const mean = arr.reduce((acc, value) => acc + value, 0) / arr.length;

  // Step 2: Calculate the squared differences from the mean
  const squaredDifferences = arr.map((value) => Math.pow(value - mean, 2));

  // Step 3: Calculate the average of the squared differences
  const meanSquaredDifferences =
    squaredDifferences.reduce((acc, value) => acc + value, 0) /
    squaredDifferences.length;

  // Step 4: Calculate the square root of the mean squared differences
  const standardDeviation = Math.sqrt(meanSquaredDifferences);

  return standardDeviation;
}

//make an array from start to end, in steps
export function createSequenceArray(start, end, step = 1) {
  const sequenceArray = [];
  for (let i = start; i <= end; i += step) {
    sequenceArray.push(i);
  }
  return sequenceArray;
}

//---------------------------------------------
/// These are for Chi-squared computations - taken from https://ytliu0.github.io/p-value_calculators/
//---------------------------------------------
// p-value for chi^2 distribution
// When ptype=true: returns 1-F_{chi^2}(chi2; n)
// When ptype=false: returns the cdf F_{chi^2}(chi2; n)
// same as R's function pchisq(chi2,n,lower.tail=FALSE) for ptype = 1
// same as R's function pchisq(chi2,n) for ptype = 2
export function pchisq(chi2, n, ptype = false) {
  if (ptype) {
    return gammq(n, 0.5 * chi2);
  } else {
    return gammp(n, 0.5 * chi2);
  }
}

// Returns the incomplete Gamma function P(n/2,x)
// Assume n is a positive integer, x>0 , won't check arguments
function gammp(n, x) {
  if (x < 0.5 * n + 1) {
    return gser(n, x);
  } else {
    return 1 - gcf(n, x);
  }
}

// Returns the incomplete Gamma function Q(n/2,x)
// Assume n is a positive integer, x>0 , won't check arguments
function gammq(n, x) {
  if (x < 0.5 * n + 1) {
    return 1 - gser(n, x);
  } else {
    return gcf(n, x);
  }
}

// Returns the incomplete gamma function P(n/2,x) evaluated by
// series representation. Algorithm from numerical recipe.
// Assume that n is a positive integer and x>0, won't check arguments.
// Relative error controlled by the eps parameter
function gser(n, x) {
  var maxit = 100000000;
  var eps = 1e-8;
  var gln = gamnln(n);
  var a = 0.5 * n;
  var ap = a;
  var sum = 1.0 / a;
  var del = sum;
  for (var n = 1; n < maxit; n++) {
    ap++;
    del = (del * x) / ap;
    sum += del;
    if (del < sum * eps) {
      break;
    }
  }
  return sum * Math.exp(-x + a * Math.log(x) - gln);
}

// Returns the incomplete gamma function Q(n/2,x) evaluated by
// its continued fraction representation. Algorithm from numerical recipe.
// Assume that n is a postive integer and x>0, won't check arguments.
// Relative error controlled by the eps parameter
function gcf(n, x) {
  var maxit = 100000000;
  var eps = 1e-8;
  var gln = gamnln(n);
  var a = 0.5 * n;
  var b = x + 1 - a;
  var fpmin = 1e-300;
  var c = 1 / fpmin;
  var d = 1 / b;
  var h = d;
  for (var i = 1; i < maxit; i++) {
    var an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < fpmin) {
      d = fpmin;
    }
    c = b + an / c;
    if (Math.abs(c) < fpmin) {
      c = fpmin;
    }
    d = 1 / d;
    var del = d * c;
    h = h * del;
    if (Math.abs(del - 1) < eps) {
      break;
    }
  }
  return h * Math.exp(-x + a * Math.log(x) - gln);
}

// Returns ln(Gamma(n/2)) for n=1,2,...
// Warning: won't check the argument
function gamnln(n) {
  // Tabulated values of ln(Gamma(n/2)) for n<201
  var lg = [
    0.5723649429247001, 0, -0.1207822376352452, 0, 0.2846828704729192,
    0.6931471805599453, 1.200973602347074, 1.791759469228055, 2.453736570842442,
    3.178053830347946, 3.957813967618717, 4.787491742782046, 5.662562059857142,
    6.579251212010101, 7.534364236758733, 8.525161361065415, 9.549267257300997,
    10.60460290274525, 11.68933342079727, 12.80182748008147, 13.94062521940376,
    15.10441257307552, 16.29200047656724, 17.50230784587389, 18.73434751193645,
    19.98721449566188, 21.2600761562447, 22.55216385312342, 23.86276584168909,
    25.19122118273868, 26.53691449111561, 27.89927138384089, 29.27775451504082,
    30.67186010608068, 32.08111489594736, 33.50507345013689, 34.94331577687682,
    36.39544520803305, 37.86108650896109, 39.3398841871995, 40.8315009745308,
    42.33561646075349, 43.85192586067515, 45.3801388984769, 46.91997879580877,
    48.47118135183522, 50.03349410501914, 51.60667556776437, 53.19049452616927,
    54.78472939811231, 56.38916764371993, 58.00360522298051, 59.62784609588432,
    61.26170176100199, 62.9049908288765, 64.55753862700632, 66.21917683354901,
    67.88974313718154, 69.56908092082364, 71.257038967168, 72.9534711841694,
    74.65823634883016, 76.37119786778275, 78.09222355331531, 79.82118541361436,
    81.55795945611503, 83.30242550295004, 85.05446701758153, 86.81397094178108,
    88.58082754219767, 90.35493026581838, 92.13617560368709, 93.92446296229978,
    95.71969454214322, 97.52177522288821, 99.33061245478741, 101.1461161558646,
    102.9681986145138, 104.7967743971583, 106.6317602606435, 108.4730750690654,
    110.3206397147574, 112.1743770431779, 114.0342117814617, 115.9000704704145,
    117.7718813997451, 119.6495745463449, 121.5330815154387, 123.4223354844396,
    125.3172711493569, 127.2178246736118, 129.1239336391272, 131.0355369995686,
    132.9525750356163, 134.8749893121619, 136.8027226373264, 138.7357190232026,
    140.6739236482343, 142.617282821146, 144.5657439463449, 146.5192554907206,
    148.477766951773, 150.4412288270019, 152.4095925844974, 154.3828106346716,
    156.3608363030788, 158.3436238042692, 160.3311282166309, 162.3233054581712,
    164.3201122631952, 166.3215061598404, 168.3274454484277, 170.3378891805928,
    172.3527971391628, 174.3721298187452, 176.3958484069973, 178.4239147665485,
    180.4562914175438, 182.4929415207863, 184.5338288614495, 186.5789178333379,
    188.6281734236716, 190.6815611983747, 192.7390472878449, 194.8005983731871,
    196.86618167289, 198.9357649299295, 201.0093163992815, 203.0868048358281,
    205.1681994826412, 207.2534700596299, 209.3425867525368, 211.435520202271,
    213.5322414945632, 215.6327221499328, 217.7369341139542, 219.8448497478113,
    221.9564418191303, 224.0716834930795, 226.1905483237276, 228.3130102456502,
    230.4390435657769, 232.5686229554685, 234.7017234428182, 236.8383204051684,
    238.9783895618343, 241.121906967029, 243.2688490029827, 245.4191923732478,
    247.5729140961868, 249.7299914986334, 251.8904022097232, 254.0541241548883,
    256.2211355500095, 258.3914148957209, 260.5649409718632, 262.7416928320802,
    264.9216497985528, 267.1047914568685, 269.2910976510198, 271.4805484785288,
    273.6731242856937, 275.8688056629533, 278.0675734403662, 280.2694086832001,
    282.4742926876305, 284.6822069765408, 286.893133295427, 289.1070536083976,
    291.3239500942703, 293.5438051427607, 295.7666013507606, 297.9923215187034,
    300.2209486470141, 302.4524659326413, 304.6868567656687, 306.9241047260048,
    309.1641935801469, 311.4071072780187, 313.652829949879, 315.9013459032995,
    318.1526396202093, 320.4066957540055, 322.6634991267262, 324.9230347262869,
    327.1852877037753, 329.4502433708053, 331.7178871969285, 333.9882048070999,
    336.2611819791985, 338.5368046415996, 340.815058870799, 343.0959308890863,
    345.3794070622669, 347.6654738974312, 349.9541180407703, 352.245326275435,
    354.5390855194408, 356.835382823613, 359.1342053695754,
  ];

  if (n < 201) {
    return lg[n - 1];
  }

  // For n>200, use the approx. formula given by numerical recipe
  // relative error < 2e-10
  var coef = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 1.208650973866179e-3, -5.395239384953e-6,
  ];
  var stp = 2.5066282746310005;
  var x = 0.5 * n;
  var y = x;
  var tmp = x + 5.5;
  tmp = (x + 0.5) * Math.log(tmp) - tmp;
  var ser = 1.000000000190015;
  for (var i = 0; i < 6; i++) {
    y = y + 1;
    ser = ser + coef[i] / y;
  }
  var gamln = tmp + Math.log((stp * ser) / x);
  return gamln;
}

// inverse of pchisq
// same as R's function qchisq(p,n,lower.tail=FALSE) for ptype = 1
// same as R's function qchisq(p,n) for ptype = 2
// Assume that 0 <= p <= 1 and n is positive integer.
// Won't check arguments.
// Find root using bisection, relative accuracy set by eps
export function qchisq(p, n, ptype) {
  // Special cases
  if (ptype == 1) {
    if (p == 0) {
      return 1 / 0;
    }
    if (p == 1) {
      return 0;
    }
  }

  if (ptype == 2) {
    if (p == 0) {
      return 0;
    }
    if (p == 1) {
      return 1 / 0;
    }
  }

  var eps = 1e-6;
  var maxIterations = 10000; // Set a maximum number of iterations

  // Bracket the root
  var min = 0;
  var sd = Math.sqrt(2.0 * n);
  var max = 2 * sd;
  var s = 1;
  if (ptype == 2) {
    s = -1;
  }

  var iterations = 0;

  // pchisq is decreasing for ptype=1, increasing for ptype=2
  while (s * pchisq(max, n, ptype) > p * s && iterations < maxIterations) {
    min = max;
    max += 2 * sd;
    iterations++;
  }

  var fun = function (x) {
    return pchisq(x, n, ptype) - p;
  };

  return bisection(fun, min, max, eps, 10000);
}

// Find the root of f(x)=0 using the method of bisection.
// f: function with one argument.
// x1 and x2 are real numbers such that x1 < x2 and f(x1)*f(x2) < 0.
// Warning: won't check if conditions about x1 and x2 are satisfied.
// They bracket the root, and are updated inside the function.
// releps sets the relative accuracy of the root: the relative accuracy
//         condition is satisfied if (x2-x1) < releps*|x|
// abseps sets the absolute accuracy of the root: the absolute accuracy condition
//         is satisfied if (x2-x1) < abseps or |f(x)| < abseps
// The function returns x when the relative accuracy condition OR the absolute
//         accuracy condition is satisfied.
function bisection(f, x1, x2, releps, abseps, maxIterations = 1000) {
  var sign = function (z) {
    if (z > 0) {
      return 1;
    } else if (z < 0) {
      return -1;
    } else {
      return 0;
    }
  };

  var f1 = sign(f(x1));
  var f2 = sign(f(x2));
  var x = 0.5 * (x1 + x2);
  var fx = f(x);
  var iterations = 0;

  while (
    x2 - x1 > abseps &&
    x2 - x1 > releps * Math.abs(x) &&
    Math.abs(fx) > abseps &&
    iterations < maxIterations
  ) {
    if (fx * f1 > 0) {
      x1 = x;
      f1 = sign(fx);
    } else {
      x2 = x;
      f2 = sign(fx);
    }
    x = 0.5 * (x1 + x2);
    fx = f(x);
    iterations++;

    if (iterations >= maxIterations) {
      // Break the loop if the maximum iterations are reached
      break;
    }
  }

  return x;
}

export function mean(data) {
  return data.reduce((sum, value) => sum + value, 0) / data.length;
}
