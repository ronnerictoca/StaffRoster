using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AimyRoster.Models
{
    public class DateTimeModelView
    {
        public string Category { get; set; }
        public int StaffId { get; set; }
        public string Name { get; set; }
        public DateTime TaskStart { get; set; }
        public DateTime TaskEnd { get; set; }
        public decimal Total { get; set; }
    }
}