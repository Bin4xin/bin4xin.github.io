---
---
{% for notes in site.data.notes %}
    {% assign note_node = notes.note_node %}
    $(document).ready(function(){
        $("#hidden-2-click-{{note_node|replace: ' ', '-'|replace: '.', '-'}}").click(function(){
            $("diva-{{note_node |replace: ' ', '-'|replace: '.', '-' }}").hide();
        });
    });
{% endfor %}