jQuery("#btn").on('click', function() {
    var $txt = jQuery("#txt");
    var caretPos = $txt[0].selectionStart;
    var textAreaTxt = $txt.val();
    var txtToAdd = "stuff";
    $txt.val(textAreaTxt.substring(0, caretPos) + txtToAdd + textAreaTxt.substring(caretPos) );
});

letters = {
a1:"ā",
a2:"á",
a3:'ǎ',
a4:"à",
e1:"ē",
e2:"é",
e3:'ě',
e4:"è",
i1:"ī",
i2:"í",
i3:'ǐ',
i4:"ì",
o1:"ō",
o2:"ó",
o3:'ǒ',
o4:"ò",
u1:"ū",
u2:"ú",
u3:"ǔ",
u4:"ù",
v1:"ǖ",
v2:"ǘ",
v3:"ǚ",
v4:"ǜ"}

var codes = {65:'a',
69:'e',
73:'i',
79:'o',
85:'u',
86:'v',
49:1,
50:2,
51:3,
52:4}

var activeVowel = "";
var onAlert = false;

$('input[name="pinyin"]').on('keydown', function(e) {
  var key = codes[e.which];
  if (onAlert) {
    if ('1234'.indexOf(key) != -1) {
      e.preventDefault();
      var $txt = $(this);
      var caretPos = $txt[0].selectionStart;
      var textAreaTxt = $txt.val();
      var tone = activeVowel + key;
      var txtToAdd = letters[tone];
      $txt.val(textAreaTxt.substring(0, caretPos-1) + txtToAdd + textAreaTxt.substring(caretPos) );
      activeVowel = "";
      $txt[0].selectionStart = caretPos;
      $txt[0].selectionEnd = caretPos;
    }
    onAlert = false;
  };
  if ('aeiou'.indexOf(key) != -1) {
    activeVowel = key;
    onAlert = true;
  };
});
