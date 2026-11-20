import {AuthShell} from '@/features/auth/AuthShell';
import {BujhiTasks} from '@/features/bujhi/BujhiTasks';
import {AccountReportReview} from '@/features/bujhi/AccountReportReview';
export default function Preview(){return <AuthShell nav="mother" userName="Synthetic QA"><BujhiTasks/><div id="report-review"><AccountReportReview pregnancies={[{id:'synthetic-qa',label:'Synthetic QA record'}]}/></div></AuthShell>}
