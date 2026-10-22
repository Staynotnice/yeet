#include "WildwoodGameMode.h"
#include "WildwoodCharacter.h"

AWildwoodGameMode::AWildwoodGameMode()
{
    DefaultPawnClass = AWildwoodCharacter::StaticClass();
}
