using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AimyRoster.Models
{
    public class DailyModelView
    {
        public string Category { get; set; }
        public int StaffId { get; set; }
        public string Name { get; set; }
        public string TaskStart { get; set; }
        public string TaskEnd { get; set; }
        public decimal Total { get; set; }
    }
}