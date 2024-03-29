$(function() {

  /*
   * If is the profile view, and have a #map, initialize the map
   */
  if ($('#map').length !== 0) {
    // Initialize the map
    if ($('#latitude').val() !== 'undefined' && $('#longitude').val() !== 'undefined') {
      OG.map.initialize($('#latitude').val(), $('#longitude').val(), 'map');
      // Add the marker
      OG.map.addNormalMarker($('#latitude').val(), $('#longitude').val(), 'map');
    } else {
      // Initial the default map
      console.log('abc');
      OG.map.initialize(35.689487, 139.691706, 'map');
    }
  }

  /*
   * Search by location part
   * If this is the index view and have a #map-index initialize the map
   */
  if ($('#index-map').length !== 0) {
    // Prevent form default action
    $('#location-form').submit(function(e) {
      e.preventDefault();
      return false;
    });

    // Later use
    // $('#search-location').keydown(function(e) {
    //   if (e.keyCode === 13) {
    //     google.maps.event.trigger(OG.map.autocomplete, 'place_changed');
    //   }
    // });

    // Default to Tokyo
    OG.map.initialize(35.689487, 139.691706, 'index-map');
    OG.map.locate();

    // Initialize place autocompletion
    OG.map.initializePlaces('search-location');

  }

  /*
   * Search by user part
   */
  $('#user-form').submit(function(e) {
    e.preventDefault();
    // Call the method to send request to server
    OG.connect.getUsers();

    return false;
  });

  /*
   * Loading more page for user
   */
  if ($('#user-form').length !== 0) {
    $(window).scroll(function() {
      if ($(window).scrollTop() === $(document).height() - $(window).height()) {
        // Call the API to get more user 
        if (!OG.connect.isRequesting) {
          OG.connect.getMoreUsers(parseInt($('#current-page').val(), 10));
        }
      }
    });
  }

  /*
   * Search for parttimer part
   */
  $('#parttimer-form').submit(function(e) {
    e.preventDefault();
    // Call the method to send request to sever
    OG.connect.getParttimers();

    return false;
  });

  /*
   * Loading more page for parttimer
   */
  if ($('#parttimer-form').length !== 0) {
    $(window).scroll(function() {
      if ($(window).scrollTop() === $(document).height() - $(window).height()) {
        // Call the API to get more user 
        console.log('abc');
        if (!OG.connect.isRequesting) {
          OG.connect.getMoreParttimers(parseInt($('#current-page').val(), 10));
        }
      }
    });
  }

  /*
   * Create pattimer form validation
   */
  $('#create-parttimer input').not('[type=submit]').jqBootstrapValidation();

  /*
   * Create category form validation
   */
  $('#create-cat-modal input').not('[type=submit]').jqBootstrapValidation();
  
  /*
   * Create gift form validatoin
   */
  $('#new-gift input').not('[type=submit]').jqBootstrapValidation();

  /*
   * Send message form validation
   */
  $('#send-message-form input').not('[type=submit]').jqBootstrapValidation();

  /*
   * Gift index modal toggle
   */
  // Remove all modal
  $('#gift-modal').on('hidden', function() {
    $(this).removeData('modal');
  });

  $('.gift-more').click(function(e) {
    e.preventDefault();
    // Get the gift id
    var giftId = $(this).data('gift-id');
    // Get the gift name
    var giftName = $(this).parents('.caption').find('.gift-name').text();
    // Chage modal header
    $('#gift-modal-inner').text(giftName);
    // Change link
    $('#edit-gift').attr('href', '/gift/edit/' + giftId);
    $('#delete-gift').attr('href', '/gift/delete/' + giftId);
    // Create new modal
    $('#gift-modal').modal({
      keyboard: true,
      remote: '/gift/' + giftId,
    });
  });

  /*
   * Order index modal
   */
  $('.gift-detail').click(function(e) {
    e.preventDefault();
    // Get the gift id
    var giftId = $(this).data('gift-id');
    // Get the gift name
    var giftName = $(this).text();
    // Chage modal header
    $('#gift-modal-inner').text(giftName);
    // Change link
    $('#edit-gift').attr('href', '/gift/edit/' + giftId);
    // Create new modal
    $('#gift-modal').modal({
      keyboard: true,
      remote: '/gift/' + giftId,
    });
  });

  /*
   * Order editable initialization
   */
  $('.order-status').editable({
    source: [
      { value: 'untouched', text: '確認待ち中' },
      { value: 'contacted', text: '確認済み' },
      { value: 'done', text: '必要な処理が行われた' }
    ],
    params: {
      '_csrf': $('#csrf').val(),
    }
  });
});
