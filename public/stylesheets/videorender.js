function render(s){
    var oth = $(".vidren");
    for(i=0;i<oth.length;i++){
        if(oth[i].id==s){
            $("#"+i).slideDown("slow");
        }else{
            oth[i].style.display ="none";
        }
    }
}