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

function finder(){
    var e =new RegExp(document.getElementById("search-bar").value,"gi") ;
    var ob = document.getElementsByClassName("course");
    var c=0;
    for(i=0;i<ob.length;i++){
        if(e.test(ob[i].id)){
            ob[i].style.display ="initial";
            c++;
        }
        else{
            ob[i].style.display ="none";
        }
    }
    document.getElementById("results").innerHTML="Result(s) found:("+c+")";
}