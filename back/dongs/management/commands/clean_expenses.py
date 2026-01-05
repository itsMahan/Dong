from django.core.management.base import BaseCommand
from dongs.models import Expense, DongMember

class Command(BaseCommand):
    help = 'Finds and optionally deletes expenses with invalid paid_by foreign keys.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Find and list corrupted expenses without deleting them.',
        )

    def handle(self, *args, **options):
        is_dry_run = options['dry_run']
        
        if is_dry_run:
            self.stdout.write(self.style.SUCCESS('Running in dry-run mode. No data will be deleted.'))
        
        self.stdout.write('Starting to scan for corrupted expenses...')
        
        deleted_count = 0
        found_count = 0
        expenses_to_check = Expense.objects.all()
        
        for expense in expenses_to_check:
            try:
                # This will raise an exception if the related DongMember does not exist
                _ = expense.paid_by.id
            except DongMember.DoesNotExist:
                found_count += 1
                if is_dry_run:
                    self.stdout.write(self.style.WARNING(f'[Dry Run] Found corrupted expense: ID={expense.id}, Title="{expense.title}"'))
                else:
                    self.stdout.write(self.style.WARNING(f'Deleting expense {expense.id} ("{expense.title}") due to invalid paid_by link.'))
                    expense.delete()
                    deleted_count += 1
        
        if is_dry_run:
            self.stdout.write(self.style.SUCCESS(f'Dry run complete. Found {found_count} corrupted expenses that would be deleted.'))
        elif deleted_count > 0:
            self.stdout.write(self.style.SUCCESS(f'Successfully deleted {deleted_count} corrupted expenses.'))
        else:
            self.stdout.write(self.style.SUCCESS('Scan complete. No corrupted expenses found.'))