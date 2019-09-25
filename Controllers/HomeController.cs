using AimyRoster.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace AimyRoster.Controllers
{
    public class HomeController : Controller
    {
        RosterEntities db = new RosterEntities();
        // GET: Home
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult SVG()
        {
            return View();
        }

        public ActionResult ReadSite()
        {
            var result = db.Site.Select(x => new SiteModelView()
            {
                Id = x.Id,
                Name = x.Name
            }).AsEnumerable();

            return Json(result,JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetStaff(int getSiteId)
        {
            //var result = db.Staffs.Where(x => x.SiteId == getSiteId)
            //    .Select(x => new StaffModelView()

            var result =
                (from sa in db.StaffAccess
                 join si in db.Site on sa.SiteId equals si.Id
                 join st in db.Staff on sa.StaffId equals st.Id
                 where (
                        si.Id == getSiteId
                        )
                 select new StaffModelView
                 {
                     StaffId = st.Id,
                     Name = st.Name,
                     SiteId = si.Id
                 }).AsEnumerable();

            return Json(result, JsonRequestBehavior.AllowGet);
        }

        public ActionResult ReadTask(DateTime weekStart,DateTime weekEnd)
        {
            var result =
                (from sr in db.StaffRoster
                 join si in db.Site on sr.SiteId equals si.Id
                 join st in db.Staff on sr.StaffId equals st.Id
                 //join refr in db.Reference on sr.RefId equals refr.Id into srRefr
                 //from subRefr in srRefr.DefaultIfEmpty()

                 where (weekStart <= sr.StartDate && weekEnd >= sr.EndDate)
                 select new TaskModelView
                 {
                     Id = sr.Id,
                     StaffId = sr.StaffId,
                     SiteId = sr.SiteId,
                     StartDate = sr.StartDate.ToString(),
                     EndDate = sr.EndDate.ToString(),
                     //SalaryCost = sr.SalaryCost,
                     //RefName = subRefr.Name
                     RefName = sr.Reference

                 }).AsEnumerable();

            return Json(result, JsonRequestBehavior.AllowGet);
        }

        public ActionResult ReadExistingTask(int optStaffId, DateTime optStartDate, DateTime optEndDate)
        {
            var result =
                (from sr in db.StaffRoster
                 join si in db.Site on sr.SiteId equals si.Id
                 join st in db.Staff on sr.StaffId equals st.Id
                 where (
                        (sr.StaffId == optStaffId) &&
                        !((sr.EndDate <= optStartDate) || (optEndDate <= sr.StartDate))
                        )
                 select new TaskModelView
                 {
                     Id = sr.Id,
                     SiteId = sr.SiteId,
                     SiteName = si.Name

                 }).AsEnumerable();

            return Json(result, JsonRequestBehavior.AllowGet);
        }

        public ActionResult EditRepeatCheck(int optStaffId, DateTime optStartDate, DateTime optEndDate, int dataId)
        {
            var result =
                (from sr in db.StaffRoster
                 join si in db.Site on sr.SiteId equals si.Id
                 join st in db.Staff on sr.StaffId equals st.Id
                 where (
                        (sr.StaffId == optStaffId) && (sr.Id != dataId) &&
                        !((sr.EndDate <= optStartDate) || (optEndDate <= sr.StartDate))
                        )
                 select new TaskModelView
                 {
                     Id = sr.Id,

                 }).AsEnumerable();

            return Json(result, JsonRequestBehavior.AllowGet);
        }

        public ActionResult SaveBooking(TaskModelView[] bookDetails)
        {
            foreach (TaskModelView book in bookDetails)
            {
                var thisBook = new StaffRoster();
                thisBook.SiteId = book.SiteId;
                thisBook.StaffId = book.StaffId;
                thisBook.StartDate = Convert.ToDateTime(book.StartDate);
                thisBook.EndDate = Convert.ToDateTime(book.EndDate);
                thisBook.RefId = book.RefId;
                thisBook.Reference = book.RefName;
                
                db.StaffRoster.Add(thisBook);
            }
            db.SaveChanges();
            
            return Json(null);
        }


        public ActionResult DeleteBooking(int[] deleteDetails)
        {
            foreach(int widgetId in deleteDetails)
            {
                var deleteWidget = db.StaffRoster.Find(widgetId);
                db.StaffRoster.Remove(deleteWidget);
            }
            db.SaveChanges();
            return null;
        }

        public ActionResult GetReference(RefModelView getRefSiteId)
        {
            var result = db.Reference.Where(x => x.SiteId.Equals(getRefSiteId.SiteId)).Select(x => new RefModelView()
            //var result = db.References.Select(x => new RefModelView()
            {
                RefId = x.Id,
                RefName = x.Name
            }).AsEnumerable();

            return Json(result, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult SaveReference(RefModelView newRef)
        {

            //var newRef = new RefModelView(int RefId);
            //newRef.RefId = RefId;
            //newRef.RefName = RefName;

            var saveRef = new Reference();
            saveRef.Name = newRef.RefName;

            db.Reference.Add(saveRef);

            db.SaveChanges();

            return Json(newRef);
        }

        public ActionResult FilterSearch(string filterText, int filterSiteId)
        {

            var searchStaff = db.StaffAccess
                .Include("db.Staff")
                .Where(x => x.Staff.Name.Contains(filterText) && x.SiteId.Equals(filterSiteId))
                .Select(x => new FilterModelView()
                {
                    FltrId = x.StaffId,
                    FltrName = x.Staff.Name,
                    FltrDisplay = x.Staff.Name + " (Staff)",
                    FltrSource = "Staff"
                }).AsEnumerable();

            var searchReference = db.Reference
                .Where(r => r.Name.Contains(filterText) && r.SiteId.Equals(filterSiteId))
                .Select(r => new FilterModelView()
                {
                    FltrId = r.Id,
                    FltrName = r.Name,
                    FltrDisplay = r.Name + " (Reference)",
                    FltrSource = "Reference"
                }).AsEnumerable();

            var result = searchStaff.Union(searchReference).OrderBy(y => y.FltrName).AsEnumerable();

            return Json(result, JsonRequestBehavior.AllowGet);
        }

        public ActionResult FilterByStaff(int getSiteId, int getStaffId)
        {
            var result =
                (from sa in db.StaffAccess
                 join si in db.Site on sa.SiteId equals si.Id
                 join st in db.Staff on sa.StaffId equals st.Id
                 where (
                        si.Id == getSiteId &&
                        st.Id == getStaffId
                        )
                 select new StaffModelView
                 {
                     StaffId = sa.StaffId,
                     Name = st.Name,
                     SiteId = si.Id
                 }).AsEnumerable();

            return Json(result, JsonRequestBehavior.AllowGet);
        }

        public ActionResult FilterByRef(DateTime weekStart, DateTime weekEnd, string getReference)
        {
            var result =
                (from sr in db.StaffRoster
                 join si in db.Site on sr.SiteId equals si.Id
                 join st in db.Staff on sr.StaffId equals st.Id
                 //join refr in db.Reference on sr.RefId equals refr.Id 
                 where (weekStart <= sr.StartDate && 
                        weekEnd >= sr.EndDate &&
                        //getReference == refr.Id
                        getReference == sr.Reference
                 )
                 select new TaskModelView
                 {
                     Id = sr.Id,
                     StaffId = sr.StaffId,
                     SiteId = sr.SiteId,
                     StartDate = sr.StartDate.ToString(),
                     EndDate = sr.EndDate.ToString(),
                     //SalaryCost = sr.SalaryCost,
                     //RefName = refr.Name
                     RefName = sr.Reference

                 }).AsEnumerable();

            return Json(result, JsonRequestBehavior.AllowGet);
        }

        public ActionResult ReadDailyTask(int TaskSite, int TaskStaffId, DateTime TaskDay)
        {
            var TaskDayEnd = TaskDay.AddDays(1);
            //var staffs =
            var result =
                (from sr in db.StaffRoster
                 join si in db.Site on sr.SiteId equals si.Id
                 join st in db.Staff on sr.StaffId equals st.Id

                 where ((TaskDay <= sr.StartDate && TaskDayEnd >= sr.EndDate) &&
                        (TaskSite == sr.SiteId) &&
                        (TaskStaffId == sr.StaffId))
                 select new DateTimeModelView
                 {
                     Category = "Staff",
                     StaffId = sr.StaffId,
                     Name = st.Name,
                     TaskStart = sr.StartDate,
                     TaskEnd = sr.EndDate,

                 }).AsEnumerable()
                 .Select(o=>
                    new DailyModelView
                    {
                        Category = o.Category,
                        StaffId = o.StaffId,
                        Name = o.Name,
                        TaskStart = o.TaskStart.ToString(@"MM\/dd\/yyyy HH:mm"),
                        TaskEnd = o.TaskEnd.ToString(@"MM\/dd\/yyyy HH:mm")
                    }
                 );

            //var totals = new List<DailyModelView>()
            //{
            //    new DailyModelView { Category = "Total", Name = "Num Children Enrolled", StaffId = 1 },
            //    new DailyModelView { Category = "Total", Name = "Total Actual Ratio", StaffId = 2 },
            //    new DailyModelView { Category = "Total", Name = "Total Qualified Staff", StaffId = 3 }
            //};

            //var result = (staffs.Any())
            //    ? staffs.Union(totals).OrderBy(y => y.Category).ThenBy(y => y.Name).AsEnumerable()
            //    : staffs;

            return Json(result, JsonRequestBehavior.AllowGet);
        }

        public ActionResult ReadScheduledUsers(int TaskSite, DateTime TaskDay)
        {
            var TaskDayEnd = TaskDay.AddDays(1);
            var staffs =
                (from sr in db.StaffRoster
                 join si in db.Site on sr.SiteId equals si.Id
                 join st in db.Staff on sr.StaffId equals st.Id

                 where ((TaskDay <= sr.StartDate && TaskDayEnd >= sr.EndDate) &&
                        TaskSite == sr.SiteId)
                 
                 select new DailyModelView
                 {
                     Category = "Staff",
                     StaffId = sr.StaffId,
                     Name = st.Name,

                 }).Distinct().AsEnumerable();

            var totals = new List<DailyModelView>()
            {
                new DailyModelView { Category = "Total", Name = "Num Children Enrolled", StaffId = 1 },
                new DailyModelView { Category = "Total", Name = "Total Actual Ratio", StaffId = 2 },
                new DailyModelView { Category = "Total", Name = "Total Qualified Staff", StaffId = 3 }
            };

            var result = (staffs.Any())
                ? staffs.Union(totals).OrderBy(y => y.Category).ThenBy(y => y.Name).AsEnumerable()
                : staffs;
            return Json(result, JsonRequestBehavior.AllowGet);
        }
    }
}