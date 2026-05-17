// Demo chart for progress
const ctx = document.getElementById('progressChart');
if (ctx) {
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun'],
      datasets: [{label:'Weight (kg)',data:[85,84,83,82,80,79],borderColor:'#6c5ce7',fill:false}]
    },
    options:{responsive:true}
  });
}
