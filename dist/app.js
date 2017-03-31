/*global $*/
$(function() {
    'use strict';
    
    var $form = $('form');
    var $output = $('.output');
    
    $form.on('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        var originalUrl = $(this).find('input').val();
        
        $.ajax({url: '/api/short/' + originalUrl})
            .done(function(data) {
                var link = '<a href="' + data.short_url + '">' + data.short_url + '</a>'
                $output.html(link);
            })
            .fail(function(err) {
               console.error(err);
               $output.text(err.message)
            });
    });
});
