$(document).ready(() => {
  $('#delete-article').on('click', (e) => {
    $target = $(e.target);
    const id = $target.data('id');
    $.ajax({
      type: 'DELETE',
      url: '/articles/'+id,
      success: (res) => {
        alert('Deleting Article!');
        window.location.href= "/";
      },
      error: (err) => {
        console.log(err);
      }
    });
  });
});
