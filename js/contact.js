
function setmail() {
  var x = document.getElementById("message").value;
  document.getElementById("link").href = "mailto:richarddip01@gmail.com?subject=Want to contact with you&body="+x;
}