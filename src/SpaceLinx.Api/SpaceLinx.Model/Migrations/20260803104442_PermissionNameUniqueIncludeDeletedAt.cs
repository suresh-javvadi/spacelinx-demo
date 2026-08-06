using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpaceLinx.Model.Migrations
{
    /// <inheritdoc />
    public partial class PermissionNameUniqueIncludeDeletedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // permission_name_key has drifted between environments as either a table CONSTRAINT
            // or a bare UNIQUE INDEX, so drop whichever form actually exists instead of assuming one.
            migrationBuilder.Sql(
                """
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conname = 'permission_name_key'
                          AND connamespace = 'application'::regnamespace
                    ) THEN
                        ALTER TABLE application.permission DROP CONSTRAINT permission_name_key;
                    ELSIF EXISTS (
                        SELECT 1 FROM pg_indexes
                        WHERE schemaname = 'application' AND indexname = 'permission_name_key'
                    ) THEN
                        DROP INDEX application.permission_name_key;
                    END IF;
                END $$;

                -- NULLS NOT DISTINCT so two rows both having deleted_at IS NULL (i.e. two active
                -- permissions with the same name) collide under the unique index. Without this,
                -- Postgres treats NULL as distinct from NULL and the active-name uniqueness that
                -- permission_name_key used to enforce would silently stop being enforced.
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_indexes
                        WHERE schemaname = 'application' AND indexname = 'permission_name_deleted_at_key'
                    ) THEN
                        CREATE UNIQUE INDEX permission_name_deleted_at_key
                            ON application.permission (name, deleted_at) NULLS NOT DISTINCT;
                    END IF;
                END $$;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1 FROM pg_indexes
                        WHERE schemaname = 'application' AND indexname = 'permission_name_deleted_at_key'
                    ) THEN
                        DROP INDEX application.permission_name_deleted_at_key;
                    END IF;
                END $$;

                -- Recreating UNIQUE(name) only holds if no two rows (active or deleted) currently
                -- share a name -- which Up() explicitly allows for deleted rows. Skip recreation
                -- rather than fail the rollback if that precondition no longer holds. Also note:
                -- this always recreates a bare INDEX, even on environments where permission_name_key
                -- was originally a table CONSTRAINT -- Down() is not a byte-faithful inverse there.
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conname = 'permission_name_key'
                          AND connamespace = 'application'::regnamespace
                    ) AND NOT EXISTS (
                        SELECT 1 FROM pg_indexes
                        WHERE schemaname = 'application' AND indexname = 'permission_name_key'
                    ) AND NOT EXISTS (
                        SELECT 1 FROM application.permission GROUP BY name HAVING count(*) > 1
                    ) THEN
                        CREATE UNIQUE INDEX permission_name_key ON application.permission (name);
                    END IF;
                END $$;
                """);
        }
    }
}
